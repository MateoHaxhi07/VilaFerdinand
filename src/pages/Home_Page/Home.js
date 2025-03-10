import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardBody,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { scaleOrdinal } from "d3-scale";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { schemeSet3 } from "d3-scale-chromatic";
import moment from "moment";

// Internal components (replace with your own relative imports)
import CategoryTreemap from "./TREE_MAP/CategoryTreemap.jsx";
import MetricsCard from "./METRIC_CARD_AND_GRAPH/MetricCard.jsx";
import Filters from "./FILTERS/Filters.jsx";
import SellerCategoriesChart from "./PIE_CHART_CATEGORIES/SellerCategoriesChart.jsx";

// -----------------------------------------------------------------------------
// GLOBAL SETTINGS
// -----------------------------------------------------------------------------

// Create a color scale for the pie chart and legend using D3
const colorScale = scaleOrdinal(schemeSet3);

// Define your API URL (adjust as needed)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Simple helper: convert Date object to YYYY-MM-DD
function toDateString(date) {
  if (!date) return "";
  return moment(date).format("YYYY-MM-DD");
}

// -----------------------------------------------------------------------------
// COMPONENT: Home (Main Dashboard)
// -----------------------------------------------------------------------------
const Home = () => {
  // ----------------------------------------------------------
  // Retrieve filter states from context
  // ----------------------------------------------------------
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    // Seller filters
    selectedSellers,
    setSelectedSellers,
    // Seller Category filters
    selectedSellerCategories,
    setSelectedSellerCategories,
    // Article filters
    selectedArticleNames,
    setSelectedArticleNames,
    // Category filters
    selectedCategories,
    setSelectedCategories,
  } = useOutletContext();

  // ----------------------------------------------------------
  // Local State for Additional Filter: selectedHours
  // ----------------------------------------------------------
  const [selectedHours, setSelectedHours] = useState([]);
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  // ----------------------------------------------------------
  // Metrics States
  // ----------------------------------------------------------
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [dailySales, setDailySales] = useState([]);

  // Pie Chart & Treemap Data
  const [pieData, setPieData] = useState([]);
  const [categoryTreemapData, setCategoryTreemapData] = useState([]);

  // Average Order Value
  const [avgOrderValueData, setAvgOrderValueData] = useState([]);
  const lineChartData = [
    {
      id: "Average Order Value",
      data: avgOrderValueData.map(item => ({
        x: item.order_date, // e.g. "2023-08-12"
        y: parseFloat(item.avg_order_value),
      })),
    },
  ];

  // ----------------------------------------------------------
  // Dropdown Options
  // ----------------------------------------------------------
  const [sellers, setSellers] = useState([]);
  const [sellerCategoriesOptions, setSellerCategoriesOptions] = useState([]);
  const [articleNamesOptions, setArticleNamesOptions] = useState([]);
  const [categories, setCategories] = useState([]);

  // ----------------------------------------------------------
  // Build query for /sales/all-data (CSV download)
  // ----------------------------------------------------------
  const buildAllDataQuery = () => {
    const queryParams = new URLSearchParams();

    // Pass "YYYY-MM-DD" strings only
    const start = toDateString(startDate);
    const end = toDateString(endDate);

    if (start) queryParams.append("startDate", start);
    if (end) queryParams.append("endDate", end);

    // If we have sellers
    if (selectedSellers?.length) {
      queryParams.append(
        "sellers",
        selectedSellers.map(s => s.value).join(",")
      );
    }
    // If we have sellerCategories
    if (selectedSellerCategories?.length) {
      queryParams.append(
        "sellerCategories",
        selectedSellerCategories.map(sc => sc.value).join(",")
      );
    }
    // If we have articleNames
    if (selectedArticleNames?.length) {
      queryParams.append(
        "articleNames",
        selectedArticleNames.map(a => a.value).join(",")
      );
    }
    // If we have categories
    if (selectedCategories?.length) {
      queryParams.append(
        "categories",
        selectedCategories.map(cat => cat.value).join(",")
      );
    }
    // If we have hours
    if (selectedHours?.length) {
      queryParams.append(
        "hours",
        selectedHours.map(h => h.value).join(",")
      );
    }

    // Optionally override limit/offset
    queryParams.append("limit", 1000000);
    queryParams.append("offset", 0);

    return queryParams.toString();
  };

  // ----------------------------------------------------------
  // Handle Download CSV
  // ----------------------------------------------------------
  const handleDownloadCsv = async () => {
    try {
      const query = buildAllDataQuery();
      const url = `${API_URL}/sales/all-data?${query}`;
      console.log("Downloading CSV from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV data: ${response.statusText}`);
      }
      const data = await response.json();

      // Convert JSON -> CSV using Papa
      const csv = Papa.unparse(data);

      // Create a Blob from the CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      // Use FileSaver to save
      saveAs(blob, "all_sales_data.csv");
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  // ----------------------------------------------------------
  // Helper function for hours filter
  // ----------------------------------------------------------
  const getHoursQuery = () =>
    selectedHours.length > 0
      ? `&hours=${selectedHours.map(h => h.value).join(",")}`
      : "";

  // ----------------------------------------------------------
  // FETCH FUNCTIONS
  // ----------------------------------------------------------

  // 1) Category Treemap
  const fetchCategoryTotals = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      let queryParams = new URLSearchParams({
        startDate: start,
        endDate: end,
      });

      if (selectedCategories?.length) {
        queryParams.append(
          "categories",
          selectedCategories.map(cat => cat.value).join(",")
        );
      }
      if (selectedSellers?.length) {
        queryParams.append(
          "sellers",
          selectedSellers.map(s => s.value).join(",")
        );
      }
      if (selectedSellerCategories?.length) {
        queryParams.append(
          "sellerCategories",
          selectedSellerCategories.map(sc => sc.value).join(",")
        );
      }
      if (selectedArticleNames?.length) {
        queryParams.append(
          "articleNames",
          selectedArticleNames.map(a => a.value).join(",")
        );
      }
      if (selectedHours?.length) {
        queryParams.append(
          "hours",
          selectedHours.map(h => h.value).join(",")
        );
      }

      const url = `${API_URL}/sales/category-total-price?${queryParams.toString()}`;
      console.log("fetchCategoryTotals ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setCategoryTreemapData(data);
    } catch (error) {
      console.error("Error fetching category totals:", error);
    }
  };

  // 2) fetchTotalSales
  const fetchTotalSales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-sales?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchTotalSales ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

  // 3) fetchTotalQuantity
  const fetchTotalQuantity = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-quantity?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchTotalQuantity ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  // 4) fetchAvgArticlePrice
  const fetchAvgArticlePrice = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/avg-article-price?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchAvgArticlePrice ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  // 5) fetchOrderCount
  const fetchOrderCount = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/order-count?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchOrderCount ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  // 6) fetchDailySales
  const fetchDailySales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/daily-sales?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchDailySales ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  // 7) fetchSellerCategoriesTotal
  const fetchSellerCategoriesTotal = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/seller-categories-total?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      console.log("fetchSellerCategoriesTotal ->", url);
      const response = await fetch(url);
      const data = await response.json();
      const formattedData = data.map(item => ({
        id: item["Seller Category"] || "Unknown",
        label: item["Seller Category"] || "Unknown",
        value: parseFloat(item.total_sales),
      }));
      setPieData(formattedData);
    } catch (error) {
      console.error("Error fetching seller categories total:", error);
    }
  };

  // -------------- FETCH for Dropdown Options --------------
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const data = await response.json();
      setSellers(data.map(s => ({ value: s, label: s })));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchSellerCategoriesOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await response.json();
      setSellerCategoriesOptions(
        data.map(cat => ({ value: cat, label: cat }))
      );
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);

      const query = new URLSearchParams();
      if (start && end) {
        query.append("startDate", start);
        query.append("endDate", end);
      }
      if (selectedSellers?.length) {
        query.append(
          "sellers",
          selectedSellers.map(s => s.value).join(",")
        );
      }
      if (selectedSellerCategories?.length) {
        query.append(
          "sellerCategories",
          selectedSellerCategories.map(sc => sc.value).join(",")
        );
      }
      if (selectedArticleNames?.length) {
        query.append(
          "articleNames",
          selectedArticleNames.map(a => a.value).join(",")
        );
      }
      if (selectedHours?.length) {
        query.append(
          "hours",
          selectedHours.map(h => h.value).join(",")
        );
      }

      const url = `${API_URL}/sales/categories?${query.toString()}`;
      console.log("fetchCategories ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNamesOptions = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);

      const query = new URLSearchParams();
      if (start && end) {
        query.append("startDate", start);
        query.append("endDate", end);
      }
      if (selectedCategories?.length) {
        query.append(
          "categories",
          selectedCategories.map(c => c.value).join(",")
        );
      }
      if (selectedSellers?.length) {
        query.append(
          "sellers",
          selectedSellers.map(s => s.value).join(",")
        );
      }
      if (selectedSellerCategories?.length) {
        query.append(
          "sellerCategories",
          selectedSellerCategories.map(sc => sc.value).join(",")
        );
      }
      if (selectedHours?.length) {
        query.append(
          "hours",
          selectedHours.map(h => h.value).join(",")
        );
      }

      const url = `${API_URL}/sales/article-names?${query.toString()}`;
      console.log("fetchArticleNamesOptions ->", url);
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(
        data.map(article => ({ value: article, label: article }))
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // ----------------------------------------------------------
  // useEffects
  // ----------------------------------------------------------

  // On mount, load base dropdown data (sellers, categories, etc.)
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  // When filters change, refresh data
  useEffect(() => {
    if (!startDate || !endDate) return;

    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchDailySales();
    fetchSellerCategoriesTotal();
    fetchCategoryTotals();

    // Also refresh categories & article names (dynamic)
    fetchCategories();
    fetchArticleNamesOptions();
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  // Styling for the datepicker (optional)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .react-datepicker__input-container input {
        background-color: #2D3748 !important;
        color: #FFF !important;
        border: 1px solid #4A5568 !important;
        padding: 8px;
        border-radius: 5px;
        font-weight: bold;
      }
      .react-datepicker {
        background-color: #2D3748 !important;
        color: #FFF !important;
      }
      .react-datepicker__day-name,
      .react-datepicker__day,
      .react-datepicker__time-name {
        color: #FFF !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ----------------------------------------------------------
  // Data Transform for Bar Chart
  // ----------------------------------------------------------
  const barData = (dailySales || [])
    .filter(item => item && item.date && item.total !== undefined)
    .map(item => ({
      date: item.date,
      total: Number(item.total),
    }));

  // ----------------------------------------------------------
  // Custom Select Styles
  // ----------------------------------------------------------
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#2D3748",
      borderColor: state.isFocused ? "#63B3ED" : "#4A5568",
      color: "#fff",
      fontWeight: "bold",
      minHeight: "40px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#2D3748",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#4A5568" : "#2D3748",
      color: "#fff",
      fontWeight: "bold",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#4A5568",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#A0AEC0",
      fontWeight: "bold",
    }),
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <Box minH="100vh" p={4} color="gray.100">
      {/* FILTERS */}
      <Filters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sellers={sellers}
        selectedSellers={selectedSellers}
        setSelectedSellers={setSelectedSellers}
        sellerCategoriesOptions={sellerCategoriesOptions}
        selectedSellerCategories={selectedSellerCategories}
        setSelectedSellerCategories={setSelectedSellerCategories}
        selectedHours={selectedHours}
        setSelectedHours={setSelectedHours}
        hoursOptions={hoursOptions}
        selectStyles={selectStyles}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        articleNamesOptions={articleNamesOptions}
        selectedArticleNames={selectedArticleNames}
        setSelectedArticleNames={setSelectedArticleNames}
      />

      {/* METRICS + BAR CHART */}
      <MetricsCard
        totalSales={totalSales}
        totalQuantity={totalQuantity}
        avgArticlePrice={avgArticlePrice}
        orderCount={orderCount}
        barData={barData}
      />

      {/* PIE + TREEMAP */}
      <Card boxShadow="md" borderRadius="md" mt={6}>
        <CardBody>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={6}
            height={{ base: "auto", md: "600px" }}
          >
            {/* LEFT SIDE: CSV Download + Pie Chart */}
            <GridItem
              bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              {/* Download CSV Button */}
              <Box mt={4} ml={4}>
                <button onClick={handleDownloadCsv}>
                  Download CSV
                </button>
              </Box>

              {/* Pie Chart */}
              <Box w="100%" h="100%" bg="white">
                <SellerCategoriesChart pieData={pieData} />
              </Box>
            </GridItem>

            {/* RIGHT SIDE: Treemap */}
            <GridItem
              bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              <Box w="100%" h="100%" bg="white">
                <CategoryTreemap data={categoryTreemapData} />
              </Box>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Home;
