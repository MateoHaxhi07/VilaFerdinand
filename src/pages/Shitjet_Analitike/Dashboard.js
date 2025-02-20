import { useState, useEffect } from "react";
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
  Card,
  Heading,
  Button,
  CardBody,
  Flex,
  Select as ChakraSelect,
  Grid,
  GridItem,
  VStack,
  Text,
  useBreakpointValue,
  Spinner,
} from "@chakra-ui/react";
import Select from "react-select";

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

const Dashboard = () => {
  // Destructure filters from outlet context (including hour filter)
  const {
    startDate,
    endDate,
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

  // Local state for table data, pagination and loading indicator
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local state for filter options
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Create hours options (0-23)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  // Calculate totals for display
  const totalQuantity = data.reduce(
    (sum, item) => sum + Number(item.Quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, item) => sum + Number(item.Total_Article_Price ?? 0),
    0
  );

  // Build URL dynamically with filters (including hours if selected)
  const fetchData = async (limit, offset) => {
    try {
      console.log("Filters:", {
        startDate,
        endDate,
        selectedSellers,
        selectedSellerCategories,
        selectedArticleNames,
        selectedCategories,
        selectedHours,
      });
      let url = `${API_URL}/sales/all-data?limit=${limit}&offset=${offset}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      url += `&sellers=${selectedSellers.map((s) => s.value).join(",")}`;
      url += `&sellerCategories=${selectedSellerCategories
        .map((cat) => cat.value)
        .join(",")}`;
      url += `&articleNames=${selectedArticleNames
        .map((article) => article.value)
        .join(",")}`;
      url += `&categories=${selectedCategories.map((cat) => cat.value).join(",")}`;
      // Append hours parameter only if selectedHours is nonempty
      if (selectedHours && selectedHours.length > 0) {
        url += `&hours=${selectedHours.map((h) => h.value).join(",")}`;
      }
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      const result = await response.json();
      console.log("API response:", result);
      let fetchedData = Array.isArray(result) ? result : result.data;
      // If hour filter is applied, filter data client-side using UTC hour
      if (selectedHours && selectedHours.length > 0) {
        const selectedHourValues = selectedHours.map((h) => Number(h.value));
        fetchedData = fetchedData.filter((row) => {
          // Use getUTCHours() as in your working Home.js
          const rowHour = new Date(row.Datetime).getUTCHours();
          console.log("Row Datetime:", row.Datetime, "UTC Hour:", rowHour);
          return selectedHourValues.includes(rowHour);
        });
      }
      setData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const result = await response.json();
      setSellers(result.map((seller) => ({ value: seller, label: seller })));
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  const fetchSellerCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const result = await response.json();
      setSellerCategories(result.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching seller categories:", error);
    }
  };

  const fetchArticleNames = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/article-names`);
      const result = await response.json();
      setArticleNames(
        result.map((article) => ({ value: article, label: article }))
      );
    } catch (error) {
      console.error("Error fetching article names:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/categories`);
      const result = await response.json();
      setCategories(result.map((cat) => ({ value: cat, label: cat })));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Reset offset when any filter changes
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

  // Fetch table data when filters or pagination change
  useEffect(() => {
    setLoading(true);
    fetchData(limit, offset);
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

  const handleLoadMore = () => {
    setOffset(offset + limit);
  };

  const handleLoadLess = () => {
    setOffset(Math.max(0, offset - limit));
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setOffset(0);
  };

  // Determine if we are in mobile view (iPhone, etc.)
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Heading mb={4}>Dashboard</Heading>
      {isMobile ? (
        // Mobile view: Render each data row as a card in a vertical stack
        <VStack spacing={4} align="stretch">
          {data.length > 0 ? (
            data.map((row) => (
              <Box
                key={row.id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg="gray.50"
                boxShadow="sm"
              >
                <Text>
                  <strong>ID:</strong> {row.id}
                </Text>
                <Text>
                  <strong>Item:</strong> {row.item}
                </Text>
                <Text>
                  <strong>Quantity:</strong> {row.quantity}
                </Text>
                <Text>
                  <strong>Sales:</strong> {row.sales}
                </Text>
              </Box>
            ))
          ) : (
            <Text textAlign="center">No data available</Text>
          )}
          {/* Totals */}
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
        // Desktop view: Render the data in a table
        <TableContainer mt={6} overflowX="auto">
          <Table variant="striped" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Item</Th>
                <Th>Quantity</Th>
                <Th>Sales</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.length > 0 ? (
                data.map((row) => (
                  <Tr key={row.id}>
                    <Td>{row.id}</Td>
                    <Td>{row.item}</Td>
                    <Td>{row.quantity}</Td>
                    <Td>{row.sales}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    No data available
                  </Td>
                </Tr>
              )}
            </Tbody>
            <Tfoot>
              <Tr>
                <Th>Total</Th>
                <Th />
                <Th>{totalQuantity}</Th>
                <Th>{totalSales}</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
      )}
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
