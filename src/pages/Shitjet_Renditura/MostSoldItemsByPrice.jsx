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
  Card,
  CardBody,
  Button,
  Flex,
  Select as ChakraSelect,
  Text,
  VStack,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";

import Filters from "./Filters03/Filters03.jsx"; // Adjust the path as needed

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// -------------------------------------------------------
// Custom react-select styles (same as in Home.js)
// -------------------------------------------------------
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

function MostSoldItemsByPrice() {
  // -----------------------------------------------------------------
  // 1) Destructure from context (date range & filter states)
  // -----------------------------------------------------------------
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
    selectedHours,
    setSelectedHours,
  } = useOutletContext();

  // -----------------------------------------------------------------
  // 2) Local states for data & pagination
  // -----------------------------------------------------------------
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------------------------------
  // 3) Local states for the *master* dropdown options (fetched once)
  // -----------------------------------------------------------------
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // For responsive layout
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Summaries
  const totalQuantity = data.reduce(
    (sum, item) => sum + Number(item.total_quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, item) => sum + Number(item.total_price ?? 0),
    0
  );

  // -----------------------------------------------------------------
  // 4) Insert custom date picker styles for dark theme
  // -----------------------------------------------------------------
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Dark theme for react-datepicker in MostSoldItemsByPrice */
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

  // -----------------------------------------------------------------
  // 5) Helper to handle Hours Query
  // -----------------------------------------------------------------
  const buildHoursQuery = () => {
    if (!selectedHours || selectedHours.length === 0) return "";
    return `&hours=${selectedHours.map((h) => h.value).join(",")}`;
  };

  // -----------------------------------------------------------------
  // 6) Build local-boundary start/end
  // -----------------------------------------------------------------
  const buildLocalBoundaries = () => {
    if (!startDate || !endDate) {
      return { localStart: null, localEnd: null };
    }
    // Start-of-day boundary for startDate
    const localStart = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0,
      0,
      0
    ).toISOString();

    // End-of-day boundary for endDate
    const localEnd = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23,
      59,
      59
    ).toISOString();

    return { localStart, localEnd };
  };

  // -----------------------------------------------------------------
  // 7) Fetch table data (most sold items by price)
  // -----------------------------------------------------------------
  const fetchData = async (limit, offset) => {
    try {
      if (!startDate || !endDate) {
        console.log("No valid date range. Skipping fetchData...");
        setLoading(false);
        return;
      }
      setLoading(true);

      // Construct local day boundaries
      const { localStart, localEnd } = buildLocalBoundaries();

      console.log("Filters for MostSoldItemsByPrice:", {
        localStart,
        localEnd,
        selectedSellers,
        selectedSellerCategories,
        selectedArticleNames,
        selectedCategories,
        selectedHours,
      });

      // Base query
      let url = `${API_URL}/sales/most-sold-items-by-price?limit=${limit}&offset=${offset}&startDate=${localStart}&endDate=${localEnd}`;

      // Build query for other filters
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
      // Add hours if selected
      url += buildHoursQuery();

      console.log("MostSoldItemsByPrice fetch URL:", url);

      // Fetch
      const resp = await fetch(url);
      const result = await resp.json();
      const fetchedData = Array.isArray(result) ? result : result.data;
      setData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data for MostSoldItemsByPrice:", error);
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // 8) Fetch "master" lists for dropdowns
  // -----------------------------------------------------------------
  const fetchSellersFn = async () => {
    try {
      const resp = await fetch(`${API_URL}/sales/sellers`);
      const data = await resp.json();
      setSellers(data.map((s) => ({ value: s, label: s })));
    } catch (err) {
      console.error("Error fetching sellers:", err);
    }
  };

  const fetchSellerCategoriesFn = async () => {
    try {
      const resp = await fetch(`${API_URL}/sales/seller-categories`);
      const data = await resp.json();
      setSellerCategories(data.map((sc) => ({ value: sc, label: sc })));
    } catch (err) {
      console.error("Error fetching seller categories:", err);
    }
  };

  const fetchArticleNamesFn = async () => {
    try {
      if (!startDate || !endDate) return; // need date range
      const { localStart, localEnd } = buildLocalBoundaries();

      let url = `${API_URL}/sales/article-names?startDate=${localStart}&endDate=${localEnd}`;

      if (selectedSellers?.length) {
        url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      }
      if (selectedSellerCategories?.length) {
        url += `&sellerCategories=${selectedSellerCategories
          .map((sc) => sc.value)
          .join(",")}`;
      }
      if (selectedCategories?.length) {
        url += `&categories=${selectedCategories.map((c) => c.value).join(",")}`;
      }
      // hours
      url += buildHoursQuery();

      console.log("fetchArticleNamesFn ->", url);
      const resp = await fetch(url);
      const data = await resp.json();
      setArticleNames(data.map((a) => ({ value: a, label: a })));
    } catch (err) {
      console.error("Error fetching article names:", err);
    }
  };

  const fetchCategoriesFn = async () => {
    try {
      if (!startDate || !endDate) return; // need date range
      const { localStart, localEnd } = buildLocalBoundaries();

      let url = `${API_URL}/sales/categories?startDate=${localStart}&endDate=${localEnd}`;

      if (selectedSellers?.length) {
        url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      }
      if (selectedSellerCategories?.length) {
        url += `&sellerCategories=${selectedSellerCategories
          .map((sc) => sc.value)
          .join(",")}`;
      }
      if (selectedArticleNames?.length) {
        url += `&articleNames=${selectedArticleNames
          .map((a) => a.value)
          .join(",")}`;
      }
      url += buildHoursQuery();

      console.log("fetchCategoriesFn ->", url);
      const resp = await fetch(url);
      const data = await resp.json();
      setCategories(data.map((c) => ({ value: c, label: c })));
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // -----------------------------------------------------------------
  // 9) On mount, fetch minimal data (sellers & sellerCategories).
  // -----------------------------------------------------------------
  useEffect(() => {
    fetchSellersFn();
    fetchSellerCategoriesFn();
  }, []);

  // 10) Re-fetch categories & articleNames whenever filters change
  useEffect(() => {
    fetchCategoriesFn();
    fetchArticleNamesFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startDate,
    endDate,
    selectedSellers,
    selectedSellerCategories,
    selectedCategories,
    selectedHours,
  ]);

  // -----------------------------------------------------------------
  // 11) Reset pagination offset on filter changes
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // 12) On offset/limit/filter changes, fetch table data
  // -----------------------------------------------------------------
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

  // -----------------------------------------------------------------
  // Pagination helpers
  // -----------------------------------------------------------------
  const handleLoadMore = () => setOffset((prev) => prev + limit);
  const handleLoadLess = () => setOffset((prev) => Math.max(0, prev - limit));
  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value, 10));
    setOffset(0);
  };

  // -----------------------------------------------------------------
  // Loading indicator
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // -----------------------------------------------------------------
  // If no data
  // -----------------------------------------------------------------
  if (!data || data.length === 0) {
    return (
      <Box p={4}>
        <Heading mb={4}>Most Sold Items By Price</Heading>
        <Text textAlign="center">No data available.</Text>
      </Box>
    );
  }

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <Card bg="white" borderRadius="lg" boxShadow="lg" mb={6} p={4}>
      <CardBody>
        {/* 
          Our unified Filters component (Filters03.jsx).
          Make sure it accepts the same props you pass in below.
        */}
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

        <Heading mb={1} textAlign="center">
          SHITJET RENDITURA SIPAS CMIMIT
        </Heading>

        {isMobile ? (
          // Mobile "cards" layout
          <VStack spacing={4} align="stretch">
            {data.map((item, idx) => (
              <Box
                key={idx}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="gray.50"
                boxShadow="sm"
              >
                <Heading as="h4" size="xs" mb={2}>
                  Rank: {idx + 1}
                </Heading>
                <Text>
                  <strong>Article Name:</strong> {item.Article_Name}
                </Text>
                <Text>
                  <strong>Total Quantity Sold:</strong>{" "}
                  {item.total_quantity?.toLocaleString() || "-"}
                </Text>
                <Text>
                  <strong>Total Article Price (ALL):</strong>{" "}
                  {item.total_price
                    ? Number(item.total_price).toLocaleString()
                    : "-"}{" "}
                  ALL
                </Text>
              </Box>
            ))}

            {/* Totals at bottom (mobile) */}
            <Box borderTop="1px solid #ccc" pt={2} mt={4}>
              <Flex justifyContent="space-between">
                <Text fontWeight="bold">TOTAL Quantity:</Text>
                <Text fontWeight="bold">
                  {totalQuantity.toLocaleString()} Units
                </Text>
              </Flex>
              <Flex justifyContent="space-between">
                <Text fontWeight="bold">TOTAL Sales:</Text>
                <Text fontWeight="bold">{totalSales.toLocaleString()} ALL</Text>
              </Flex>
            </Box>
          </VStack>
        ) : (
          // Desktop table layout
          <TableContainer
            overflowY="auto"
            maxH="60vh"
            overflowX="auto"
            mt={6}
            borderRadius="lg"
            boxShadow="md"
            p={4}
          >
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Rank</Th>
                  <Th>Article Name</Th>
                  <Th>Total Quantity Sold</Th>
                  <Th>Total Article Price (ALL)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>{idx + 1}</Td>
                    <Td>{item.Article_Name}</Td>
                    <Td>{item.total_quantity?.toLocaleString() || "-"}</Td>
                    <Td>
                      {item.total_price
                        ? Number(item.total_price).toLocaleString()
                        : "-"}{" "}
                      ALL
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              <Tfoot>
                <Tr bg="gray.100" fontWeight="bold">
                  <Td colSpan={2} textAlign="center">
                    TOTAL
                  </Td>
                  <Td>{totalQuantity.toLocaleString()} Units</Td>
                  <Td>{totalSales.toLocaleString()} ALL</Td>
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
      </CardBody>
    </Card>
  );
}

export default MostSoldItemsByPrice;
