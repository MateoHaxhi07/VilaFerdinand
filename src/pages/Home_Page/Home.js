// src/pages/Home_Page/Home.js

//#region 1)IMPORTS
// React and routing utilities
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

// Chakra UI components used throughout the dashboard
import { Box } from "@chakra-ui/react";

// Child components that render the graphs and filter controls
import { AllGraphs } from "./allgraphs.jsx";
import Filters from "./FILTERS/Filters.jsx";

// Utility library for formatting dates
import moment from "moment";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

//#endregion


//#region Helpers
// Convert a Date object to YYYY-MM-DD for API queries
function toDateString(date) {
  if (!date) return "";
  return moment(date).format("YYYY-MM-DD");
}
//#endregion

//#region Home component
// Main dashboard page displaying filters and graphs
export default function Home() {
  //#region Outlet context
  // Retrieve filter values from the parent layout so multiple pages share them
  const {
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
    showFilters,
    setShowFilters,
  } = useOutletContext();
  //#endregion

  //#region Local state
  const [sellers, setSellers] = useState([]);
  const [sellerCategoriesOptions, setSellerCategoriesOptions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articleNamesOptions, setArticleNamesOptions] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]);
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  //#endregion

  //#region Metrics state
  // Totals and averages displayed in the dashboard cards
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // Time-series data for charts
  const [dailySales, setDailySales] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);

  // Data for pie and treemap visuals
  const [pieData, setPieData] = useState([]);
  const [categoryTreemapData, setCategoryTreemapData] = useState([]);

  // Toggle between daily and monthly bar charts
  const [barViewMode, setBarViewMode] = useState("daily");

  //#endregion

  //#region Query builders
  // We don't show the CSV button in Home now because the download is handled
  // in the sidebar, but this helper can generate the full query string if
  // needed for exporting data.
  const buildAllDataQuery = () => {
    const queryParams = new URLSearchParams();
    const start = toDateString(startDate);
    const end = toDateString(endDate);

    if (start) queryParams.append("startDate", start);
    if (end) queryParams.append("endDate", end);

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
    if (selectedCategories?.length) {
      queryParams.append(
        "categories",
        selectedCategories.map(cat => cat.value).join(",")
      );
    }
    if (selectedHours?.length) {
      queryParams.append(
        "hours",
        selectedHours.map(h => h.value).join(",")
      );
    }
    queryParams.append("limit", 1000000);
    queryParams.append("offset", 0);

    return queryParams.toString();
  };

  // Hours filter query
  const getHoursQuery = () =>
    selectedHours.length > 0
      ? `&hours=${selectedHours.map(h => h.value).join(",")}`
      : "";
  //#endregion

  //#region Fetch functions
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

      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

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

      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

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

      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

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

      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

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

      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/monthly-sales?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

      const response = await fetch(url);
      const data = await response.json();
      setMonthlySales(data || []);
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
    }
  };

  const fetchSellerCategoriesTotal = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;
      const hoursQuery = getHoursQuery();
      const url = `${API_URL}/sales/seller-categories-total?startDate=${start}&endDate=${end}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(sc => sc.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}${hoursQuery}`;

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

  const fetchCategoryTotals = async () => {
    try {
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      if (!start || !end) return;

      const queryParams = new URLSearchParams({ startDate: start, endDate: end });

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
      const response = await fetch(url);
      const data = await response.json();
      setCategoryTreemapData(data);
    } catch (error) {
      console.error("Error fetching category totals:", error);
    }
  };
  //#endregion

  //#region Dropdown fetches (sellers, categories, etc.)
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
      const start = toDateString(startDate);
      const end = toDateString(endDate);
      const query = new URLSearchParams();

      if (start && end) {
        query.append("startDate", start);
        query.append("endDate", end);
      }
      if (selectedSellers?.length) {
        query.append("sellers", selectedSellers.map(s => s.value).join(","));
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
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(
        data.map(article => ({ value: article, label: article }))
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  //#endregion

  //#region useEffects
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchDailySales();
    fetchMonthlySales();
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

  //#endregion

  //#region Derived data
  // Build bar chart data
  const dailyBarData = (dailySales || [])
    .filter(item => item && item.date && item.total !== undefined)
    .map(item => ({
      date: item.date,
      total: Number(item.total),
    }));

  const monthlyBarData = (monthlySales || [])
    .filter(item => item && item.month && item.total !== undefined)
    .map(item => ({
      date: item.month,
      total: Number(item.total),
    }));

  const barData = barViewMode === "daily" ? dailyBarData : monthlyBarData;

  // We have pieData & categoryTreemapData from fetchSellerCategoriesTotal & fetchCategoryTotals

  // Custom Select Styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#2D3748",
      borderColor: state.isFocused ? "#63B3ED" : "#4A5568",
      color: "#fff",
      fontWeight: "bold",
      minHeight: "40px",
    }),
    menu: base => ({
      ...base,
      backgroundColor: "#2D3748",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#4A5568" : "#2D3748",
      color: "#fff",
      fontWeight: "bold",
    }),
    singleValue: base => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: "#4A5568",
    }),
    multiValueLabel: base => ({
      ...base,
      color: "#fff",
      fontWeight: "bold",
    }),
    placeholder: base => ({
      ...base,
      color: "#A0AEC0",
      fontWeight: "bold",
    }),
  };

  //#endregion

  //#endregion

  //#region Render
  return (
    <Box
      // Use your background image
  
      backgroundSize="cover"        // fill the container
      backgroundPosition="center"   // center the image
      backgroundRepeat="no-repeat"  // no tiling
      minH="100vh"
      w="100%"
      color="gray.800"
      pt="80px"
      px={4}
    >
    {showFilters && (
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
    )}

    <AllGraphs
      totalSales={totalSales}
      totalQuantity={totalQuantity}
      avgArticlePrice={avgArticlePrice}
      orderCount={orderCount}
      barData={barData}
      barViewMode={barViewMode}
      setBarViewMode={setBarViewMode}
      pieData={pieData}
      categoryTreemapData={categoryTreemapData}
        // ADD THESE carefullyu
  startDate={startDate}
  endDate={endDate}
  selectedSellers={selectedSellers}
  selectedSellerCategories={selectedSellerCategories}
  selectedArticleNames={selectedArticleNames}
  selectedCategories={selectedCategories}
  selectedHours={selectedHours}
    />
  </Box>
  );
}
//#endregion
