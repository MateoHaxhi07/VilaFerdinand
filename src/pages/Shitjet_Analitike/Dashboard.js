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

  // Local state for table data and pagination
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

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
    } catch (error) {
      console.error("Error fetching data:", error);
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

  return (
    <Card bg="white.100" borderRadius="lg" boxShadow="lg" mb={6} p={4}>
      <CardBody>
        <Heading
          size="md"
          mb={6}
          color="black"
          fontWeight="bold"
          textAlign="center"
        >
          SHITJET ANALITIKE
        </Heading>
        <Flex wrap="wrap" gap={6} justifyContent="center">
          {[
            {
              label: "Sellers",
              options: sellers,
              value: selectedSellers,
              onChange: setSelectedSellers,
            },
            {
              label: "Seller Categories",
              options: sellerCategories,
              value: selectedSellerCategories,
              onChange: setSelectedSellerCategories,
            },
            {
              label: "Article Names",
              options: articleNames,
              value: selectedArticleNames,
              onChange: setSelectedArticleNames,
            },
            {
              label: "Categories",
              options: categories,
              value: selectedCategories,
              onChange: setSelectedCategories,
            },
            {
              label: "Hour",
              options: hoursOptions,
              value: selectedHours,
              onChange: setSelectedHours,
            },
          ].map(({ label, options, value, onChange }) => (
            <Box
              key={label}
              bgGradient="linear(to-r, green.600, teal.400)"
              minW={{ base: "150px", md: "200px" }}
            >
              <Box
                mb={2}
                color="white"
                fontWeight="bold"
                bgGradient="linear(to-r, green.600, teal.400)"
                fontSize="sm"
              >
                {label}
              </Box>
              <Select
                isMulti
                options={options}
                onChange={onChange}
                placeholder={`Select ${label.toLowerCase()}`}
                menuPortalTarget={document.body}
                styles={customSelectStyles}
                value={value}
              />
            </Box>
          ))}
        </Flex>
      </CardBody>
      <Card
        bg="white.800"
        borderRadius="lg"
        boxShadow="lg"
        bgGradient="linear(to-r, gray.200, gray.300)"
        mt={6}
        p={4}
      >
        <CardBody>
          <TableContainer overflowY="auto" maxH="60vh" overflowX="auto">
            <Table variant="striped" colorScheme="gray">
              <Thead>
                <Tr>
                  <Th>Seller</Th>
                  <Th>Article Name</Th>
                  <Th>Category</Th>
                  <Th>Quantity</Th>
                  <Th>Article Price</Th>
                  <Th>Total Article Price</Th>
                  <Th>Datetime</Th>
                  <Th>Seller Category</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((row, index) => (
                  <Tr key={index}>
                    <Td>{row.Seller}</Td>
                    <Td>{row.Article_Name}</Td>
                    <Td>{row.Category}</Td>
                    <Td>{row.Quantity}</Td>
                    <Td>{parseFloat(row.Article_Price).toFixed(0)} ALL</Td>
                    <Td>{parseFloat(row.Total_Article_Price).toFixed(0)} ALL</Td>
                    <Td>{new Date(row.Datetime).toUTCString()}</Td>
                    <Td>{row["Seller Category"]}</Td>
                  </Tr>
                ))}
              </Tbody>
              <Tfoot>
                <Tr bg="gray.100" fontWeight="bold">
                  <Td colSpan={3} textAlign="center">
                    TOTAL
                  </Td>
                  <Td>{totalQuantity.toLocaleString()} Units</Td>
                  <Td colSpan={1} textAlign="center"></Td>
                  <Td>{totalSales.toLocaleString()} ALL</Td>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
          <Flex mt={4} justifyContent="space-between">
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
    </Card>
  );
};

export default Dashboard;
