import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
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
} from '@chakra-ui/react';
import Select from 'react-select';

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
    customSelectStyles,
  } = useOutletContext();

  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Local state for filter options
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Build URL dynamically with filters
  const fetchData = async (limit, offset) => {
    try {
      // Debugging filters
      console.log("Filters:", { startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories });
      
      let url = `${API_URL}/sales/all-data?limit=${limit}&offset=${offset}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      url += `&sellers=${selectedSellers.map(seller => seller.value).join(',')}`;
      url += `&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(',')}`;
      url += `&articleNames=${selectedArticleNames.map(article => article.value).join(',')}`;
      url += `&categories=${selectedCategories.map(cat => cat.value).join(',')}`;
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      const result = await response.json();
      console.log("API response:", result);
      // If the API returns { data: [...] } then use result.data; otherwise, assume result is the array.
      setData(Array.isArray(result) ? result : result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  // Fetch filter options
  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/sellers`);
      const result = await response.json();
      setSellers(result.map(seller => ({ value: seller, label: seller })));
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchSellerCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/seller-categories`);
      const result = await response.json();
      setSellerCategories(result.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error('Error fetching seller categories:', error);
    }
  };

  const fetchArticleNames = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/article-names`);
      const result = await response.json();
      setArticleNames(result.map(article => ({ value: article, label: article })));
    } catch (error) {
      console.error('Error fetching article names:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/sales/categories`);
      const result = await response.json();
      setCategories(result.map(cat => ({ value: cat, label: cat })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchSellers();
    fetchSellerCategories();
    fetchArticleNames();
    fetchCategories();
  }, []);

  // Reset offset when filters change
  useEffect(() => {
    setOffset(0);
  }, [startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories]);

  useEffect(() => {
    fetchData(limit, offset);
  }, [limit, offset, startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories]);

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
    <Card bg="gray.900" borderRadius="lg" boxShadow="lg" mb={6} p={4}>
      <CardBody>
        <Heading size="md" mb={6} color="white" fontWeight="bold" textAlign="center">
          SHITJET SIPAS ORES
        </Heading>
        <Flex wrap="wrap" gap={6} justifyContent="center">
          {[{ label: 'Sellers', options: sellers, value: selectedSellers, onChange: setSelectedSellers },
            { label: 'Seller Categories', options: sellerCategories, value: selectedSellerCategories, onChange: setSelectedSellerCategories },
            { label: 'Article Names', options: articleNames, value: selectedArticleNames, onChange: setSelectedArticleNames },
            { label: 'Categories', options: categories, value: selectedCategories, onChange: setSelectedCategories }]
            .map(({ label, options, value, onChange }) => (
              <Box key={label} minW={{ base: "150px", md: "200px" }}>
                <Box mb={2} color="white" fontWeight="bold" fontSize="sm">
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
      <Card bg="white.800" borderRadius="lg" boxShadow="lg" mt={6} p={4}>
        <CardBody>
          <TableContainer>
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
                    <Td>{new Date(row.Datetime).toLocaleString()}</Td>
                    <Td>{row["Seller Category"]}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>


      <Flex justifyContent="space-between" mb={4}>
       
        </Flex>  
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