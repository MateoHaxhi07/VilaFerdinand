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
  Heading,
  Button,
  Flex,
  Select as ChakraSelect,
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
    selectedSellerCategories,
    selectedArticleNames,
    selectedCategories,
    selectedHours,
  } = useOutletContext();

  // Local state for table data, pagination and loading indicator
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  // (Optional) Local state for filter options
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Create hours options (0-23)
  const hoursOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, "0"),
  }));

  // Calculate totals using API field names
  const totalQuantity = data.reduce(
    (sum, item) => sum + Number(item.Quantity ?? item.quantity ?? 0),
    0
  );
  const totalSales = data.reduce(
    (sum, item) =>
      sum + Number(item.Total_Article_Price ?? item.total_price ?? 0),
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

  // If no data is returned, show a message
  if (!data || data.length === 0) {
    return (
      <Box p={4}>
        <Heading mb={4}>Dashboard</Heading>
        <Text textAlign="center">No data available.</Text>
      </Box>
    );
  }

  return (
    <Box p={4} align="center"marginBottom={4}>
      <Heading mb={4}>SHITJET ANALITIKE</Heading>
      {isMobile ? (
        // Mobile view: Render each data row as a card in a vertical stack
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
                <strong>Quantity:</strong> {row.Quantity ?? row.quantity ?? 0}
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
        // Desktop view: Render the data in a table with Datetime and Seller columns
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
                  <Td>{new Date(row.Datetime).toLocaleString()}</Td>
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
