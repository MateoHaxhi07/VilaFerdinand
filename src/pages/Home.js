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
  Select as ChakraSelect,
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

  // Utility: Adjust start and end dates for full-day coverage
  const getAdjustedDates = () => {
    const adjustedStart = new Date(startDate);
    adjustedStart.setHours(0, 0, 0, 0);
    const adjustedEnd = new Date(endDate);
    adjustedEnd.setHours(23, 59, 59, 999);
    return { adjustedStart, adjustedEnd };
  };

  // ---------- FETCH FUNCTIONS ----------
  const fetchTotalSales = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/total-sales?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchTotalQuantity = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/total-quantity?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchAvgArticlePrice = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/avg-article-price?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchOrderCount = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/order-count?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchMostSoldItems = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/most-sold-items?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchMostSoldItemsByPrice = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/most-sold-items-by-price?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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

  const fetchDailySales = async () => {
    try {
      const { adjustedStart, adjustedEnd } = getAdjustedDates();
      const url = `${API_URL}/sales/daily-sales?startDate=${adjustedStart.toISOString()}&endDate=${adjustedEnd.toISOString()}&sellers=${selectedSellers
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
  useEffect(() => {
    fetchSellers();
    fetchSellerCategoriesOptions();
    fetchCategories();
    fetchArticleNamesOptions();
  }, []);

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
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
        <GridItem>
          <Card bg="gray.800">
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: 'sm', md: 'lg' }} color="white" fontWeight="bold">
                  Total Sales
                </StatLabel>
                <StatNumber fontSize={{ base: 'md', md: 'xl' }} color="white" fontWeight="bold">
                  {parseFloat(totalSales).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText fontSize="sm" color="white" fontWeight="bold">
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
                <StatLabel fontSize={{ base: 'sm', md: 'lg' }} color="white" fontWeight="bold">
                  Total Quantity
                </StatLabel>
                <StatNumber fontSize={{ base: 'md', md: 'xl' }} color="white" fontWeight="bold">
                  {parseFloat(totalQuantity).toFixed(0)}
                </StatNumber>
                <StatHelpText fontSize="sm" color="white" fontWeight="bold">
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
                <StatLabel fontSize={{ base: 'sm', md: 'lg' }} color="white" fontWeight="bold">
                  Avg. Article Price
                </StatLabel>
                <StatNumber fontSize={{ base: 'md', md: 'xl' }} color="white" fontWeight="bold">
                  {parseFloat(avgArticlePrice).toLocaleString()} ALL
                </StatNumber>
                <StatHelpText fontSize="sm" color="white" fontWeight="bold">
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
                <StatLabel fontSize={{ base: 'sm', md: 'lg' }} color="white" fontWeight="bold">
                  Transactions
                </StatLabel>
                <StatNumber fontSize={{ base: 'md', md: 'xl' }} color="white" fontWeight="bold">
                  {orderCount}
                </StatNumber>
                <StatHelpText fontSize="sm" color="white" fontWeight="bold">
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

      {/* Table Sectiondd */}
      <Box p={{ base: 2, md: 5 }}>
        <Heading as="h1" size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 5 }}>
          Most Sold Items by Total Article Price
        </Heading>
        <Flex justifyContent="space-between" mb={{ base: 3, md: 4 }}>
          <ChakraSelect width={{ base: "150px", md: "200px" }} value={limit} onChange={handleLimitChange}>
            <option value={50}>50 rows</option>
            <option value={200}>200 rows</option>
            <option value={500}>500 rows</option>
          </ChakraSelect>
        </Flex>
        {data.length > 0 ? (
          <>
            <TableContainer>
              <Table variant="striped" colorScheme="teal">
                <Thead>
                  <Tr>
                    <Th fontSize={{ base: "sm", md: "md" }}>Ranking</Th>
                    <Th fontSize={{ base: "sm", md: "md" }}>Article Name</Th>
                    <Th fontSize={{ base: "sm", md: "md" }}>Total Quantity Sold</Th>
                    <Th fontSize={{ base: "sm", md: "md" }}>Total Article Price (ALL)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((row, index) => {
                    // Calculate normalized ranking (best rank gets value 1, worst gets 0)
                    const rank = index + 1;
                    const normalized = data.length > 1 ? (data.length - rank) / (data.length - 1) : 1;
                    const bucket = Math.min(Math.floor(normalized * 5), 4);
                    const heatmapColor = ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00"][bucket];
                    return (
                      <Tr key={index}>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          <Box
                            width="20px"
                            height="20px"
                            bg={heatmapColor}
                            borderRadius="full"
                            display="inline-block"
                            mr={2}
                          />
                          {rank}
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>{row.Article_Name}</Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          {row.total_quantity ? Number(row.total_quantity).toLocaleString() : '-'}
                        </Td>
                        <Td fontSize={{ base: "xs", md: "sm" }}>
                          {row.total_price ? Number(row.total_price).toLocaleString() : '-'} ALL
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
            <Flex mt={{ base: 3, md: 4 }} justifyContent="space-between">
              <Button onClick={handleLoadLess} isDisabled={offset === 0} size={{ base: "sm", md: "md" }}>
                Previous
              </Button>
              <Button onClick={handleLoadMore} isDisabled={data.length < limit} size={{ base: "sm", md: "md" }}>
                Next
              </Button>
            </Flex>
          </>
        ) : (
          <Box mt={{ base: 3, md: 4 }}>
            <Heading as="h2" size={{ base: "md", md: "lg" }}>
              No data available
            </Heading>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Home;
