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
  Heading,
  Button,
  Flex,
  Select as ChakraSelect,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import Select from 'react-select';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
    <Box p={5}>
      <Heading as="h1" size="lg" mb={5}>
        Dashboard
      </Heading>
      <Flex justifyContent="space-between" mb={4}>
        <ChakraSelect width="200px" value={limit} onChange={handleLimitChange}>
          <option value={50}>50 rows</option>
          <option value={200}>200 rows</option>
          <option value={500}>500 rows</option>
        </ChakraSelect>
      </Flex>
      <Grid gap={4} mb={4} templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(4, 1fr)' }}>
        <GridItem>
          <Select
            isMulti
            options={sellers}
            onChange={setSelectedSellers}
            placeholder="Select sellers"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={selectedSellers}
          />
        </GridItem>
        <GridItem>
          <Select
            isMulti
            options={sellerCategories}
            onChange={setSelectedSellerCategories}
            placeholder="Select seller categories"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={selectedSellerCategories}
          />
        </GridItem>
        <GridItem>
          <Select
            isMulti
            options={articleNames}
            onChange={setSelectedArticleNames}
            placeholder="Select article names"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={selectedArticleNames}
          />
        </GridItem>
        <GridItem>
          <Select
            isMulti
            options={categories}
            onChange={setSelectedCategories}
            placeholder="Select categories"
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            value={selectedCategories}
          />
        </GridItem>
      </Grid>
      {data.length > 0 ? (
        <>
          <TableContainer>
            <Table variant="striped" colorScheme="teal">
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
                    <Td>${parseFloat(row.Article_Price).toFixed(2)}</Td>
                    <Td>${parseFloat(row.Total_Article_Price).toFixed(2)}</Td>
                    <Td>{new Date(row.Datetime).toLocaleString()}</Td>
                    <Td>{row["Seller Category"]}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Flex mt={4} justifyContent="space-between">
            <Button onClick={handleLoadLess} isDisabled={offset === 0}>
              Previous
            </Button>
            <Button onClick={handleLoadMore} isDisabled={data.length < limit}>
              Next
            </Button>
          </Flex>
        </>
      ) : (
        <Box mt={4}>
          <Heading as="h2" size="md">
            No data available
          </Heading>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;