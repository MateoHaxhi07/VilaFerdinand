import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Box,
  Heading,
  Grid,
  Text as ChakraText,
  GridItem,
  Card,
  CardBody,
  Stat,
  CardHeader,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { scaleOrdinal } from "d3-scale";
import CategoryTreemap from "./TREE_MAP/CategoryTreemap.jsx";
import MetricsCard from "./METRIC_CARD_AND_GRAPH/MetricCard.jsx";
import Filters from "./FILTERS/Filters.jsx";
import SellerCategoriesChart from "./PIE_CHART_CATEGORIES/SellerCategoriesChart.jsx";

import { schemeSet3 } from "d3-scale-chromatic";

// -----------------------------------------------------------------------------
// GLOBAL SETTINGS
// -----------------------------------------------------------------------------

// Create a color scale for the pie chart and legend using D3
const colorScale = scaleOrdinal(schemeSet3);

// Define your API URL (adjust as needed)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// -----------------------------------------------------------------------------
// COMPONENT: Home (Main Dashboard)
// -----------------------------------------------------------------------------
const Home = () => {
  // ----------------------------------------------------------
  // Retrieve filter states from context
  // ----------------------------------------------------------
  const {
    // Instead of using default null, we can set some initial date range
    // in the context. If your context doesn't do that, we'll do it here for safety.
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedSellers,
    setSelectedSellers,
    selectedSellerCategories,
    setSelectedSellerCategories,
    selectedArticleNames,
    setSelectedArticleNames,
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
        x: item.order_date,  // e.g. "2023-08-12"
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
  // Use a function to build the &hours= param
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
      // If your date states are sometimes null, ensure they have defaults:
      if (!startDate || !endDate) {
        console.log("Skipping fetchCategoryTotals because no date range set.");
        return;
      }

      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (selectedCategories?.length) {
        queryParams.append(
          "categories",
          selectedCategories.map(cat => cat.value).join(","),
        );
      }
      if (selectedSellers?.length) {
        queryParams.append(
          "sellers",
          selectedSellers.map(s => s.value).join(","),
        );
      }
      if (selectedSellerCategories?.length) {
        queryParams.append(
          "sellerCategories",
          selectedSellerCategories.map(sc => sc.value).join(","),
        );
      }
      if (selectedArticleNames?.length) {
        queryParams.append(
          "articleNames",
          selectedArticleNames.map(a => a.value).join(","),
        );
      }
      if (selectedHours?.length) {
        queryParams.append(
          "hours",
          selectedHours.map(h => h.value).join(","),
        );
      }

      const url = `${API_URL}/sales/category-total-price?${queryParams.toString()}`;
      console.log("fetchCategoryTotals ->", url); // Debug
      const response = await fetch(url);
      const data = await response.json();
      setCategoryTreemapData(data);
    } catch (error) {
      console.error("Error fetching category totals:", error);
    }
  };

  // 2) Build the rest similarly, e.g. fetchTotalSales, fetchTotalQuantity, etc.
  const fetchTotalSales = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;

      console.log("fetchTotalSales ->", url); // Debug
      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

  const fetchTotalQuantity = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/total-quantity?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;
      console.log("fetchTotalQuantity ->", url); // Debug

      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  const fetchAvgArticlePrice = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/avg-article-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;
      console.log("fetchAvgArticlePrice ->", url); // Debug

      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  const fetchOrderCount = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/order-count?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;
      console.log("fetchOrderCount ->", url); // Debug

      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  const fetchDailySales = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/daily-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;
      console.log("fetchDailySales ->", url); // Debug

      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  const fetchSellerCategoriesTotal = async () => {
    try {
      if (!startDate || !endDate) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/seller-categories-total?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join("")}${hoursQuery}`;
      console.log("fetchSellerCategoriesTotal ->", url); // Debug

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
      setSellerCategoriesOptions(data.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      // Build a query that includes date range, sellers, etc.
      let url = `${API_URL}/sales/categories?`;
      const queryParams = [];
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      if (selectedSellers?.length) {
        queryParams.push(
          `sellers=${selectedSellers.map(s => s.value).join(",")}`,
        );
      }
      if (selectedSellerCategories?.length) {
        queryParams.push(
          `sellerCategories=${selectedSellerCategories
            .map(sc => sc.value)
            .join(",")}`,
        );
      }
      if (selectedArticleNames?.length) {
        queryParams.push(
          `articleNames=${selectedArticleNames.map(a => a.value).join(",")}`,
        );
      }

      // Add hour filter if needed
      if (selectedHours?.length) {
        queryParams.push(`hours=${selectedHours.map(h => h.value).join(",")}`);
      }

      // Construct final
      url += queryParams.join("&");

      console.log("fetchCategories ->", url); // Debug
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNamesOptions = async () => {
    try {
      let url = `${API_URL}/sales/article-names?`;
      const queryParams = [];

      // Include date
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      // categories
      if (selectedCategories?.length) {
        queryParams.push(
          `categories=${selectedCategories.map(cat => cat.value).join(",")}`,
        );
      }
      // sellers
      if (selectedSellers?.length) {
        queryParams.push(
          `sellers=${selectedSellers.map(s => s.value).join(",")}`,
        );
      }
      // seller categories
      if (selectedSellerCategories?.length) {
        queryParams.push(
          `sellerCategories=${selectedSellerCategories
            .map(sc => sc.value)
            .join(",")}`,
        );
      }
      // hours
      if (selectedHours?.length) {
        queryParams.push(`hours=${selectedHours.map(h => h.value).join(",")}`);
      }

      url += queryParams.join("&");

      console.log("fetchArticleNamesOptions ->", url); // Debug
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(
        data.map(article => ({ value: article, label: article })),
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // ----------------------------------------------------------
  // useEffects
  // ----------------------------------------------------------
  // 1) On mount
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  // 2) When filters change
  useEffect(() => {
    // If you set default start/end in context, ensure they are not null
    if (!startDate || !endDate) return;

    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchDailySales();
    fetchSellerCategoriesTotal();
    fetchCategoryTotals();


    // Also update categories & article name options so they reflect new filters
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

  // 3) DatePicker Dark Theme
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
            height={{ base: "auto", md: "600px" }} // So they match in desktop
          >
            <GridItem
              bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              {/* Pie Chart */}
              <Box w="100%" h="100%" bg="white">
                <SellerCategoriesChart pieData={pieData} />
              </Box>
            </GridItem>

            <GridItem
              bg="white"
              borderRadius="md"
              overflow="hidden"
              minH={{ base: "400px", md: "100%" }}
            >
              {/* Treemap */}
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
