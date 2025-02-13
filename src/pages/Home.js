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
  Button,
  Stack,
  Flex,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { ResponsiveBar } from "@nivo/bar";

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

  // Dropdown options
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // ---------- FETCH FUNCTIONS ----------

  // 1) Fetch total sales
  const fetchTotalSales = async () => {
    try {
      const url = `${API_URL}/sales/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
        .join(",")}`;
      const response = await fetch(url);
      const data = await response.json();
      setAvgArticlePrice(data.avg_price || 0);
    } catch (error) {
      console.error("Error fetching average article price:", error);
    }
  };

  // 4) Fetch order count (if your backend has such an endpoint)
  const fetchOrderCount = async () => {
    try {
      const url = `${API_URL}/sales/order-count?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&sellers=${selectedSellers
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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
        .map(s => s.value)
        .join(",")}&sellerCategories=${selectedSellerCategories
        .map(cat => cat.value)
        .join(",")}&articleNames=${selectedArticleNames
        .map(a => a.value)
        .join(",")}&categories=${selectedCategories
        .map(cat => cat.value)
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

  const fetchSellerCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await response.json();
      setSellerCategories(data.map((cat) => ({ value: cat, label: cat })));
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

  const fetchArticleNames = async () => {
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
      setArticleNames(data.map((article) => ({ value: article, label: article })));
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  // ---------- USE EFFECTS ----------

  // 1) On mount, fetch initial dropdown data
  useEffect(() => {
    fetchSellers();
    fetchSellerCategories();
    fetchCategories();
    fetchArticleNames();
  }, []);

  // 2) Re-fetch metrics whenever filters change
  useEffect(() => {
    fetchTotalSales();
    fetchTotalQuantity();
    fetchAvgArticlePrice();
    fetchOrderCount(); // only if you have an endpoint for it
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
      <Heading mb={6} textAlign="center">
        Restaurant Dashboard
      </Heading>

      {/* Top Metrics */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6} mb={6}>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel>Total Sales</StatLabel>
                <StatNumber>
                  {parseFloat(totalSales).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  ALL
                </StatNumber>
                <StatHelpText>Based on selected filters</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel>Total Quantity</StatLabel>
                <StatNumber>{parseFloat(totalQuantity).toFixed(0)}</StatNumber>
                <StatHelpText>Based on selected filters</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel>Avg. Article Price</StatLabel>
                <StatNumber>
                  {parseFloat(avgArticlePrice).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{" "}
                  ALL
                </StatNumber>
                <StatHelpText>
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
                <StatLabel>Transactions</StatLabel>
                <StatNumber>{orderCount}</StatNumber>
                <StatHelpText>Unique orders by datetime</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Filter Section */}
      <Card bg="gray.800" mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>
            Filters
          </Heading>
          <Flex wrap="wrap" gap={4}>
            {/* Date Range */}
            <Box>
              <Box mb={2}>Start Date</Box>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                portalId="root-portal"
              />
            </Box>
            <Box>
              <Box mb={2}>End Date</Box>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                portalId="root-portal"
              />
            </Box>
            {/* Seller */}
            <Box minW="200px">
              <Box mb={2}>Seller</Box>
              <Select
                isMulti
                options={sellers}
                onChange={setSelectedSellers}
                placeholder="Select sellers"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                value={selectedSellers}
              />
            </Box>
            {/* Seller Category */}
            <Box minW="200px">
              <Box mb={2}>Seller Category</Box>
              <Select
                isMulti
                options={sellerCategories}
                onChange={setSelectedSellerCategories}
                placeholder="Select categories"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                value={selectedSellerCategories}
              />
            </Box>
            {/* Article Name */}
            <Box minW="200px">
              <Box mb={2}>Article Name</Box>
              <Select
                isMulti
                options={articleNames}
                onChange={setSelectedArticleNames}
                placeholder="Select articles"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                value={selectedArticleNames}
              />
            </Box>
            {/* Category */}
            <Box minW="200px">
              <Box mb={2}>Category</Box>
              <Select
                isMulti
                options={categories}
                onChange={setSelectedCategories}
                placeholder="Select categories"
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                value={selectedCategories}
              />
            </Box>
            {/* Fetch Button */}
            <Box alignSelf="flex-end">
              <Button
                colorScheme="teal"
                onClick={() => {
                  // Force re-fetch if user wants to manually click
                  fetchTotalSales();
                  fetchTotalQuantity();
                  fetchAvgArticlePrice();
                  fetchOrderCount();
                  fetchMostSoldItems();
                  fetchMostSoldItemsByPrice();
                  fetchDailySales();
                }}
              >
                Fetch Data
              </Button>
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* Chart Section */}
      <Box bg="gray.800" p={4} borderRadius="md" mb={6}>
        <Heading size="md" mb={4}>
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

      {/* Most Sold Items */}
      <Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
        <Card bg="gray.800">
          <CardBody>
            <Heading size="md" mb={4}>
              Most Sold Items
            </Heading>
            <Stack spacing={2}>
              {mostSoldItems.map((item, index) => (
                <Box key={index}>
                  {item.Article_Name}: {item.total_quantity}
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
        <Card bg="gray.800">
          <CardBody>
            <Heading size="md" mb={4}>
              Most Sold Items by Price
            </Heading>
            <Stack spacing={2}>
              {mostSoldItemsByPrice.map((item, index) => (
                <Box key={index}>
                  {item.Article_Name}: $
                  {typeof item.total_price === "number"
                    ? item.total_price.toFixed(2)
                    : item.total_price}
                </Box>
              ))}
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
};

export default Home;
