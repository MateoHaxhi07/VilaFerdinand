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
import moment from "moment-timezone";   // <-- Import moment-timezone
import Filters from "./FILTER/Filter.jsx"; // Adjust path as needed

// Use environment variable for API URL, or fallback
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/** 
 * Custom react-select styles 
 * (If you need this for your <Filters> component. 
 * If not needed, you can remove.)
 */
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
  // --------------------------------------------------------------------------
  // 1) Pull in shared filter state from your parent via React Router "outlet"
  // --------------------------------------------------------------------------
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    selectedSellers, setSelectedSellers,
    selectedSellerCategories, setSelectedSellerCategories,
    selectedArticleNames, setSelectedArticleNames,
    selectedCategories, setSelectedCategories,
    selectedHours, setSelectedHours,
  } = useOutletContext();

  // --------------------------------------------------------------------------
  // 2) Local state: table data, loading, pagination
  // --------------------------------------------------------------------------
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------------------
  // 3) Local state: master dropdown arrays (sellers, categories, etc.)
  // --------------------------------------------------------------------------
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // --------------------------------------------------------------------------
  // 4) Computed totals (optional)
  // --------------------------------------------------------------------------
  const totalQuantity = data.reduce(
    (sum, row) => sum + Number(row.Quantity ?? row.quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, row) =>
      sum + Number(row.Total_Article_Price ?? row.total_price ?? 0),
    0
  );

  // --------------------------------------------------------------------------
  // 5) [Optional] Insert a style override for the datepicker dark theme
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 6) Helper to build the “hours” query if selected
  // --------------------------------------------------------------------------
  const buildHoursQuery = () => {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  };

  // --------------------------------------------------------------------------
  // 7) Fetch the "all-data" from the server
  // --------------------------------------------------------------------------
  const fetchData = async (limitValue, offsetValue) => {
    try {
      if (!startDate || !endDate) {
        console.log("No valid date range, skipping fetch");
        setLoading(false);
        return;
      }
      setLoading(true);

      // ----
      // Option A) Just pass date strings (YYYY-MM-DD) if your backend expects them. E.g.:
      //   const startStr = moment(startDate).format("YYYY-MM-DD");
      //   const endStr   = moment(endDate).format("YYYY-MM-DD");
      //   let url = `${API_URL}/sales/all-data?startDate=${startStr}&endDate=${endStr}...`

      // Option B) Keep your approach with local midnight => .toISOString()
      //   so you get "2023-08-10T00:00:00.000Z" for your queries
      // ----
      const localStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        0, 0, 0
      ).toISOString();

      const localEnd = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23, 59, 59
      ).toISOString();

      // Build your query
      let url = `${API_URL}/sales/all-data?limit=${limitValue}&offset=${offsetValue}` +
                `&startDate=${localStart}&endDate=${localEnd}`;

      if (selectedSellers?.length) {
        url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      }
      if (selectedSellerCategories?.length) {
        url += `&sellerCategories=${selectedSellerCategories.map((sc) => sc.value).join(",")}`;
      }
      if (selectedArticleNames?.length) {
        url += `&articleNames=${selectedArticleNames.map((a) => a.value).join(",")}`;
      }
      if (selectedCategories?.length) {
        url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
      }
      // Append hours if needed
      url += buildHoursQuery();

      console.log("Fetching table data from:", url);
      const resp = await fetch(url);
      const result = await resp.json();
      setData(Array.isArray(result) ? result : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 8) Whenever the filters change, reset offset to 0
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 9) Whenever offset/limit or filters change, fetch data
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchData(limit, offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, offset, startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories, selectedHours]);

  // --------------------------------------------------------------------------
  // 10) Fetch sellers, categories, etc. for the <Filters> (optional)
  // --------------------------------------------------------------------------
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

      // Categories
      const catResp = await fetch(`${API_URL}/sales/categories`);
      const catData = await catResp.json();
      setCategories(catData.map((c) => ({ value: c, label: c })));

      // Article Names
      const anResp = await fetch(`${API_URL}/sales/article-names`);
      const anData = await anResp.json();
      setArticleNames(anData.map((a) => ({ value: a, label: a })));
    } catch (err) {
      console.error("Error fetching dropdown options:", err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  // --------------------------------------------------------------------------
  // 11) Pagination handlers
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // 12) Responsive check for mobile or desktop
  // --------------------------------------------------------------------------
  const isMobile = useBreakpointValue({ base: true, md: false });

  // --------------------------------------------------------------------------
  // 13) Handle loading or empty states
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={4}>
        <Heading mb={4}>SHITJET ANALITIKE</Heading>
        <Text>No data available for that range.</Text>
      </Box>
    );
  }

  // --------------------------------------------------------------------------
  // 14) Render the table or mobile cards
  // --------------------------------------------------------------------------
  return (
    <Box p={4} align="center" marginBottom={4}>
      {/* Filters at the top */}
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
        // ------------------ MOBILE "CARD" VIEW ------------------
        <VStack spacing={4} align="stretch">
          {data.map((row, idx) => (
            <Box
              key={idx}
              borderWidth="1px"
              borderRadius="md"
              p={4}
              bg="gray.50"
              boxShadow="sm"
            >
              <Text><strong>Seller:</strong> {row.Seller}</Text>
              <Text><strong>Article:</strong> {row.Article_Name}</Text>
              <Text><strong>Quantity:</strong> {row.Quantity}</Text>
              <Text><strong>Sales:</strong> {row.Total_Article_Price}</Text>
              <Text>
                <strong>Datetime:</strong>{" "}
                {moment.utc(row.Datetime)  // parse as UTC
                  .tz("Europe/Tirane")      // convert to local zone
                  .format("YYYY-MM-DD HH:mm")}
              </Text>
            </Box>
          ))}
          {/* Totals at the bottom (mobile) */}
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
        // ------------------ DESKTOP TABLE VIEW ------------------
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
              {data.map((row, idx) => (
                <Tr key={idx}>
                  <Td>{row.Seller}</Td>
                  <Td>{row.Article_Name}</Td>
                  <Td>{row.Quantity}</Td>
                  <Td>{row.Total_Article_Price}</Td>
                  <Td>
                    {moment.utc(row.Datetime)
                      .tz("Europe/Tirane")
                      .format("YYYY-MM-DD HH:mm")}
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

      {/* Pagination controls */}
      <Flex mt={4} justifyContent="space-between" alignItems="center" width="100%" maxW="800px">
        <Button onClick={handleLoadLess} isDisabled={offset === 0}>
          Previous
        </Button>

        <ChakraSelect width="150px" value={limit} onChange={handleLimitChange}>
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
