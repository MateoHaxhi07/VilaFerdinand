import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Box,
  Heading,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Stack,
  Flex,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";


// Use the same API base as your Home.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Home = () => {
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
  } = useOutletContext();

  // ---------- STATE ----------
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [avgArticlePrice, setAvgArticlePrice] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [mostSoldItems, setMostSoldItems] = useState([]);
  const [mostSoldItemsByPrice, setMostSoldItemsByPrice] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [pieData, setPieData] = useState([]);

  // ---------- CUSTOM SELECT STYLES ----------
  const customSelectStyles = {
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

  // Dropdown options state
  const [sellers, setSellers] = useState([]);
  const [sellerCategoriesOptions, setSellerCategoriesOptions] = useState([]);
  const [articleNamesOptions, setArticleNamesOptions] = useState([]);
  const [categories, setCategories] = useState([]);

  // ---------- FETCH FUNCTIONS ----------

  // 1) Fetch total sales
  const fetchTotalSales = async () => {
    try {
      const url = `${API_URL}/sales/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setTotalSales(data.total_sales || 0);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  };

  // 2) Fetch total quantity
  const fetchTotalQuantity = async () => {
    try {
      const url = `${API_URL}/sales/total-quantity?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setTotalQuantity(data.total_quantity || 0);
    } catch (error) {
      console.error("Error fetching total quantity:", error);
    }
  };

  // 3) Fetch average article price
  const fetchAvgArticlePrice = async () => {
    try {
      const url = `${API_URL}/sales/avg-article-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  // 4) Fetch order count
  const fetchOrderCount = async () => {
    try {
      const url = `${API_URL}/sales/order-count?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrderCount(data.order_count || 0);
    } catch (error) {
      console.error("Error fetching order count:", error);
    }
  };

  // 5) Fetch most sold items
  const fetchMostSoldItems = async () => {
    try {
      const url = `${API_URL}/sales/most-sold-items?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setMostSoldItems(data || []);
    } catch (error) {
      console.error("Error fetching most sold items:", error);
    }
  };

  // 6) Fetch most sold items by price
  const fetchMostSoldItemsByPrice = async () => {
    try {
      const url = `${API_URL}/sales/most-sold-items-by-price?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setMostSoldItemsByPrice(data || []);
    } catch (error) {
      console.error("Error fetching most sold items by price:", error);
    }
  };

  // 7) Fetch daily sales (for the chart)
  const fetchDailySales = async () => {
    try {
      const url = `${API_URL}/sales/daily-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map((s) => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map((a) => a.value)
        .join(",")}&categories=${selectedCategories
        .map((cat) => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setDailySales(data || []);
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    }
  };

  // ---------- DROPDOWN FETCHES ----------
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const data = await response.json();
      setSellers(data.map((s) => ({ value: s, label: s })));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchSellerCategoriesOptions = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await response.json();
      setSellerCategoriesOptions(data.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      let url = `${API_URL}/sales/categories?`;
      const queryParams = [];
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      if (selectedSellers?.length) {
        queryParams.push(`sellers=${selectedSellers.map((s) => s.value).join(",")}`);
      }
      if (selectedSellerCategories?.length) {
        queryParams.push(`sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`);
      }
      if (selectedArticleNames?.length) {
        queryParams.push(`articleNames=${selectedArticleNames.map((a) => a.value).join(",")}`);
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchArticleNamesOptions = async () => {
    try {
      let url = `${API_URL}/sales/article-names?`;
      const queryParams = [];
      if (selectedCategories?.length) {
        queryParams.push(`categories=${selectedCategories.map((cat) => cat.value).join(",")}`);
      }
      if (selectedSellers?.length) {
        queryParams.push(`sellers=${selectedSellers.map((s) => s.value).join(",")}`);
      }
      if (selectedSellerCategories?.length) {
        queryParams.push(`sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`);
      }
      if (startDate && endDate) {
        queryParams.push(`startDate=${startDate.toISOString()}`);
        queryParams.push(`endDate=${endDate.toISOString()}`);
      }
      url += queryParams.join("&");
      const response = await fetch(url);
      const data = await response.json();
      setArticleNamesOptions(data.map((article) => ({ value: article, label: article })));
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // ---------- USE EFFECTS ----------
  // On mount, fetch initial dropdown data
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

  // Re-fetch metrics whenever filters change
  useEffect(() => {
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount();
    fetchMostSoldItems();
    fetchMostSoldItemsByPrice();
    fetchDailySales();
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
  ]);

  // Fetch pie chart data for seller category sales
  useEffect(() => {
    const fetchSalesBySellerCategory = async () => {
      try {
        const url = `${API_URL}/sales/sales-by-seller-category?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        const response = await fetch(url);
        const data = await response.json();
        const formattedData = data.map((item) => ({
          id: item["Seller Category"] || "Unknown",
          label: item["Seller Category"] || "Unknown",
          value: parseFloat(item.total_sales),
        }));
        setPieData(formattedData);
      } catch (error) {
        console.error("Error fetching sales by seller category:", error);
      }
    };
    fetchSalesBySellerCategory();
  }, [startDate, endDate]);

  // Inject custom styles for DatePicker with cleanup
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

  // ---------- CHART DATA ----------
  const barData = (dailySales || [])
    .filter((item) => item && item.date && item.total !== undefined)
    .map((item) => ({
      date: item.date,
      total: Number(item.total),
    }));

  const averageTotal =
    barData.reduce((sum, item) => sum + item.total, 0) / (barData.length || 1);

  const CustomTooltip = ({ value, indexValue }) => (
    <Box p="8px" bg="white" border="1px solid #ccc">
      <strong>{indexValue}</strong>
      <br />
      Total Article Price:{" "}
      <Box as="span" fontWeight="bold" color="black">
        {Number(value).toLocaleString()} ALL
      </Box>
    </Box>
  );

  // ---------- RENDER ----------
  return (
    <Box bg="gray.900" minH="100vh" p={4} color="gray.100">
      <Heading mb={6} textAlign="center" fontWeight="bold">
        Restaurant Dashboard
      </Heading>

      {/* Top Metrics */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel color="white" fontWeight="bold">
                  Total Sales
                </StatLabel>
                <StatNumber color="white" fontWeight="bold">
                  {parseFloat(totalSales).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText color="white" fontWeight="bold">
                  Based on selected filters
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel color="white" fontWeight="bold">
                  Total Quantity
                </StatLabel>
                <StatNumber color="white" fontWeight="bold">
                  {parseFloat(totalQuantity).toFixed(0)}
                </StatNumber>
                <StatHelpText color="white" fontWeight="bold">
                  Based on selected filters
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel color="white" fontWeight="bold">
                  Avg. Article Price
                </StatLabel>
                <StatNumber color="white" fontWeight="bold">
                  {parseFloat(avgArticlePrice).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText color="white" fontWeight="bold">
                  Calculated from total sales/quantity
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel color="white" fontWeight="bold">
                  Transactions
                </StatLabel>
                <StatNumber color="white" fontWeight="bold">
                  {orderCount}
                </StatNumber>
                <StatHelpText color="white" fontWeight="bold">
                  Unique orders by datetime
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Filter Section */}
      <Card bg="gray.800" mb={6}>
        <CardBody>
          <Heading size="md" mb={4} color="orange" fontWeight="bold">
            Filters
          </Heading>
          <Flex wrap="wrap" gap={4}>
            {/* Date Range */}
            <Box>
              <Box mb={2} color="white" fontWeight="bold">
                Start Date
              </Box>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                portalId="root-portal"
                className="dark-datepicker"
              />
            </Box>
            <Box>
              <Box mb={2} color="white" fontWeight="bold">
                End Date
              </Box>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                portalId="root-portal"
                className="dark-datepicker"
              />
            </Box>

            {/* Seller */}
            <Box minW="200px">
              <Box mb={2} color="white" fontWeight="bold">
                Seller
              </Box>
              <Select
                isMulti
                options={sellers}
                onChange={setSelectedSellers}
                placeholder="Select sellers"
                menuPortalTarget={document.body}
                styles={customSelectStyles}
                value={selectedSellers}
              />
            </Box>
            {/* Seller Category */}
            <Box minW="200px">
              <Box mb={2} color="white" fontWeight="bold">
                Seller Category
              </Box>
              <Select
                isMulti
                options={sellerCategoriesOptions}
                onChange={setSelectedSellerCategories}
                placeholder="Select categories"
                menuPortalTarget={document.body}
                styles={customSelectStyles}
                value={selectedSellerCategories}
              />
            </Box>
            {/* Article Name */}
            <Box minW="200px">
              <Box mb={2} color="white" fontWeight="bold">
                Article Name
              </Box>
              <Select
                isMulti
                options={articleNamesOptions}
                onChange={setSelectedArticleNames}
                placeholder="Select articles"
                menuPortalTarget={document.body}
                styles={customSelectStyles}
                value={selectedArticleNames}
              />
            </Box>
            {/* Category */}
            <Box minW="200px">
              <Box mb={2} color="white" fontWeight="bold">
                Category
              </Box>
              <Select
                isMulti
                options={categories}
                onChange={setSelectedCategories}
                placeholder="Select categories"
                menuPortalTarget={document.body}
                styles={customSelectStyles}
                value={selectedCategories}
              />
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* Chart Section */}
      <Box bg="gray.900" p={4} borderRadius="md" mb={6}>
        <Heading size="md" mb={4} color="white" fontWeight="bold">
          Daily Sales
        </Heading>
        <Box height="400px">
          <ResponsiveBar
            data={barData}
            keys={["total"]}
            indexBy="date"
            margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={() => "#008080"}
            borderColor={{ theme: "background" }}
            tooltip={({ value, indexValue }) => (
              <CustomTooltip value={value} indexValue={indexValue} />
            )}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: 32,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "",
              legendOffset: -40,
              legendPosition: "middle",
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="white"
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 12,
                    fontWeight: "bold",
                    fill: "#ffffff",
                  },
                },
              },
            }}
            markers={[
              {
                axis: "y",
                value: averageTotal,
                lineStyle: { stroke: "#b0413e", strokeWidth: 2 },
                legend: "Average",
                legendOrientation: "vertical",
                legendPosition: "right",
              },
            ]}
          />
        </Box>
      </Box>

      

     {/* Most Sold Items + Pie Chart Side by Side */}
    <Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(1, 1fr)" }}>
      <Card bg="gray.700" p={4} borderRadius="lg" mb={6}>
        <CardBody>
          <Heading
            size="md"
            mb={4}
            color="white"
            fontWeight="bold"
            textAlign="center"
          >
            Most Sold Items
          </Heading>

          {/* Nested grid: Left side (lists), Right side (pie chart) */}
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Left column: By Quantity & By Total Sales */}
            <Box>
              <Heading
                size="sm"
                mb={3}
                color="white"
                textAlign="center"
                borderBottom="2px solid white"
                pb={2}
              >
                By Quantity
              </Heading>
              <Stack spacing={2}>
                {mostSoldItems.length > 0 ? (
                  mostSoldItems.map((item, index) => (
                    <Box
                      key={index}
                      color="white"
                      fontWeight="bold"
                      bg="gray.800"
                      p={2}
                      borderRadius="md"
                    >
                      {index + 1}. {item.Article_Name}:{" "}
                      {Math.floor(item.total_quantity).toLocaleString()}
                    </Box>
                  ))
                ) : (
                  <Box color="gray.300" textAlign="center">
                    No data available
                  </Box>
                )}
              </Stack>

              <Heading
                size="sm"
                mt={6}
                mb={3}
                color="white"
                textAlign="center"
                borderBottom="2px solid white"
                pb={2}
              >
                By Total Sales
              </Heading>
              <Stack spacing={2}>
                {mostSoldItemsByPrice.length > 0 ? (
                  mostSoldItemsByPrice.map((item, index) => (
                    <Box
                      key={index}
                      color="white"
                      fontWeight="bold"
                      bg="gray.800"
                      p={2}
                      borderRadius="md"
                    >
                      {index + 1}. {item.Article_Name}:{" "}
                      {Number(item.total_price).toLocaleString()} ALL
                    </Box>
                  ))
                ) : (
                  <Box color="gray.300" textAlign="center">
                    No data available
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Right column: Pie Chart */}
            <Box height="300px" mb={6}>
              <ResponsivePie
                data={pieData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.4}
                padAngle={0.7}
                cornerRadius={3}
                colors={{ scheme: "set3" }}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
                radialLabelsSkipAngle={10}
                radialLabelsTextColor="#ffffff"
                radialLabelsLinkColor="#ffffff"
                sliceLabelsSkipAngle={10}
                sliceLabelsTextColor="#000000"
                tooltip={({ datum }) => (
                  <Box p="8px" bg="white" border="1px solid #ccc">
                    <strong style={{ color: "black", fontWeight: "bold" }}>
                      {datum.id}
                    </strong>
                    <br />
                    <Box as="span" fontWeight="bold" color="black">
                      {datum.value.toLocaleString()} ALL
                    </Box>
                  </Box>
                )}
                sliceLabel={(datum) => (
                  <text style={{ fontWeight: "bold", fill: "black" }}>
                    {datum.id}
                  </text>
                )}
                legends={[
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 4,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: "#ffffff",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                  },
                ]}
              />
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </Grid>
  </Box>












  );
};

export default Home;
