import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Tfoot,
  Td,
  TableContainer,
  Box,
  Heading,
  Button,
  Flex,
  Select as ChakraSelect,
  VStack,
  Text,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";
import Filters from "./FILTER/Filter.jsx"; // Adjust path as needed

// Use environment variable for API URL, or default
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// -----------------------------------------------------------------------------
// Custom react-select styles (same as in Home.js, if you want them consistent)
// -----------------------------------------------------------------------------
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

const Dashboard = () => {
  // ---------------------------------------------------------------------------
  // 1) Destructure filter states from your outlet context
  //    Make sure your parent has selectedHours + setSelectedHours in context
  // ---------------------------------------------------------------------------
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
    selectedHours,         // Must exist in context
    setSelectedHours,      // Must exist in context
  } = useOutletContext();

  // ---------------------------------------------------------------------------
  // 2) Local states for the table data + pagination
  // ---------------------------------------------------------------------------
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // 3) Local states for the "master" dropdown arrays
  //    If you want them dynamic based on filters, replicate the logic from Home.js
  // ---------------------------------------------------------------------------
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Summaries (optional)
  const totalQuantity = data.reduce(
    (sum, item) => sum + Number(item.Quantity ?? item.quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, item) =>
      sum + Number(item.Total_Article_Price ?? item.total_price ?? 0),
    0
  );

  // ---------------------------------------------------------------------------
  // 4) Insert a style tag for react-datepicker dark theme
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Dark theme for react-datepicker in Dashboard */
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

  // ---------------------------------------------------------------------------
  // 5) Helper to build Hours query
  // ---------------------------------------------------------------------------
  const buildHoursQuery = () => {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  };

  // ---------------------------------------------------------------------------
  // 6) Fetch table data from the backend
  //    We create local day boundaries for startDate/endDate to fix single-day issue
  // ---------------------------------------------------------------------------
  const fetchData = async (limit, offset) => {
    try {
      if (!startDate || !endDate) {
        console.log("No valid date range set. Skipping table data fetch.");
        setLoading(false);
        return;
      }

      setLoading(true);

      // Create local day boundaries (midnight to 23:59:59)
      const localStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0,
        0,
        0
      ).toISOString();

      const localEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59
      ).toISOString();

      // Build base URL
      let url = `${API_URL}/sales/all-data?limit=${limit}&offset=${offset}&startDate=${localStart}&endDate=${localEnd}`;

      // Add filters
      if (selectedSellers?.length) {
        url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      }
      if (selectedSellerCategories?.length) {
        url += `&sellerCategories=${selectedSellerCategories
          .map((cat) => cat.value)
          .join(",")}`;
      }
      if (selectedArticleNames?.length) {
        url += `&articleNames=${selectedArticleNames
          .map((a) => a.value)
          .join(",")}`;
      }
      if (selectedCategories?.length) {
        url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
      }

      // Add hours
      url += buildHoursQuery();

      console.log("Dashboard fetching URL:", url);
      const response = await fetch(url);
      const result = await response.json();
      console.log("API response:", result);

      let fetchedData = Array.isArray(result) ? result : result.data;
      setData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7) Reset offset when any filter changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setOffset(0);
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  // ---------------------------------------------------------------------------
  // 8) Whenever offset/limit or filters change, fetch the table data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchData(limit, offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    limit,
    offset,
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  ]);

  // ---------------------------------------------------------------------------
  // 9) Fetch "master" dropdown options (sellers, categories, etc.)
  //    If you want them unfiltered, do it once on mount
  //    If you want them *filtered*, replicate your logic from Home.js
  // ---------------------------------------------------------------------------
  const fetchDropdowns = async () => {
    try {
      // Sellers
      const sellersResp = await fetch(`${API_URL}/sales/sellers`);
      const sellersData = await sellersResp.json();
      setSellers(sellersData.map((s) => ({ value: s, label: s })));

      // Seller Categories
      const scResp = await fetch(`${API_URL}/sales/seller-categories`);
      const scData = await scResp.json();
      setSellerCategories(scData.map((sc) => ({ value: sc, label: sc })));

      // Categories (unfiltered)
      const catResp = await fetch(`${API_URL}/sales/categories`);
      const catData = await catResp.json();
      setCategories(catData.map((c) => ({ value: c, label: c })));

      // Article Names (unfiltered)
      const anResp = await fetch(`${API_URL}/sales/article-names`);
      const anData = await anResp.json();
      setArticleNames(anData.map((a) => ({ value: a, label: a })));
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  // Only once on mount in this example (unfiltered).
  useEffect(() => {
    fetchDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // 10) Pagination Handlers
  // ---------------------------------------------------------------------------
  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };
  const handleLoadLess = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setOffset(0);
  };

  // For responsive layout
  const isMobile = useBreakpointValue({ base: true, md: false });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // ---------------------------------------------------------------------------
  // No data
  // ---------------------------------------------------------------------------
  if (!data || data.length === 0) {
    return (
      <Box p={4}>
        <Heading mb={4}>Dashboard</Heading>
        <Text textAlign="center">No data available.</Text>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box p={4} align="center" marginBottom={4}>
      {/* 11) Render the Filters at the top */}
      <Filters
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sellers={sellers}
        selectedSellers={selectedSellers}
        setSelectedSellers={setSelectedSellers}
        sellerCategoriesOptions={sellerCategories}
        selectedSellerCategories={selectedSellerCategories}
        setSelectedSellerCategories={setSelectedSellerCategories}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        articleNamesOptions={articleNames}
        selectedArticleNames={selectedArticleNames}
        setSelectedArticleNames={setSelectedArticleNames}
        selectedHours={selectedHours}
        setSelectedHours={setSelectedHours}
        selectStyles={customSelectStyles}
      />

      <Heading mb={4}>SHITJET ANALITIKE</Heading>

      {isMobile ? (
        // MOBILE VIEW as "cards"
        <VStack spacing={4} align="stretch">
          {data.map((row) => (
            <Box
              key={row.id}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
              boxShadow="sm"
            >
              <Text>
                <strong>Seller:</strong> {row.Seller}
              </Text>
              <Text>
                <strong>Article:</strong> {row.Article_Name || row.item}
              </Text>
              <Text>
                <strong>Quantity:</strong>{" "}
                {row.Quantity ?? row.quantity ?? 0}
              </Text>
              <Text>
                <strong>Sales:</strong>{" "}
                {row.Total_Article_Price ?? row.total_price ?? 0}
              </Text>
              <Text>
                <strong>Datetime:</strong>{" "}
                {new Date(row.Datetime).toLocaleString()}
              </Text>
            </Box>
          ))}
          {/* Totals at bottom (mobile) */}
          <Box borderTop="1px solid #ccc" pt={2} mt={4}>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">Total Quantity:</Text>
              <Text fontWeight="bold">{totalQuantity}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="bold">Total Sales:</Text>
              <Text fontWeight="bold">{totalSales}</Text>
            </Flex>
          </Box>
        </VStack>
      ) : (
        // DESKTOP VIEW as a table
        <TableContainer mt={6} overflowX="auto">
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Seller</Th>
                <Th>Article</Th>
                <Th>Quantity</Th>
                <Th>Sales</Th>
                <Th>Datetime</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => (
                <Tr key={row.id}>
                  <Td>{row.Seller}</Td>
                  <Td>{row.Article_Name || row.item}</Td>
                  <Td>{row.Quantity ?? row.quantity ?? 0}</Td>
                  <Td>{row.Total_Article_Price ?? row.total_price ?? 0}</Td>
                  <Td>
                    {new Date(row.Datetime).toLocaleString("en-US", {
                      timeZone: "Europe/Tirane", 
                    })}
                  </Td>
                </Tr>
              ))}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>TOTAL</Th>
                <Th />
                <Th>{totalQuantity}</Th>
                <Th>{totalSales}</Th>
                <Th />
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Controls */}
      <Flex mt={4} justifyContent="space-between" alignItems="center">
        <Button onClick={handleLoadLess} isDisabled={offset === 0}>
          Previous
        </Button>
        <ChakraSelect width="200px" value={limit} onChange={handleLimitChange}>
          <option value={50}>50 rows</option>
          <option value={200}>200 rows</option>
          <option value={500}>500 rows</option>
        </ChakraSelect>
        <Button onClick={handleLoadMore} isDisabled={data.length < limit}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default Dashboard;
