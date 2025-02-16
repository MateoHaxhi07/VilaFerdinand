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
  Card,
  CardBody,
  Button,
  Flex,
  Select as ChakraSelect,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import Select from 'react-select';

// Use environment variable for API URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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



const MostSoldItemsByPrice = () => {
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

  // Data & Pagination state
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Local state for filter options
  const [sellers, setSellers] = useState([]);
  const [sellerCategories, setSellerCategories] = useState([]);
  const [articleNames, setArticleNames] = useState([]);
  const [categories, setCategories] = useState([]);

  // Heatmap colors from worst (red) to best (green)
  const heatmapColors = ["#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", "#00FF00"];

  // Fetch most sold items by total article price with filters & pagination
  const fetchData = async (limit, offset) => {
    try {
      console.log("Filters:", {
        startDate,
        endDate,
        selectedSellers,
        selectedSellerCategories,
        selectedArticleNames,
        selectedCategories,
      });
      let url = `${API_URL}/sales/most-sold-items-by-price?limit=${limit}&offset=${offset}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      url += `&sellers=${selectedSellers.map(seller => seller.value).join(',')}`;
      url += `&sellerCategories=${selectedSellerCategories.map(cat => cat.value).join(',')}`;
      url += `&articleNames=${selectedArticleNames.map(article => article.value).join(',')}`;
      url += `&categories=${selectedCategories.map(cat => cat.value).join(',')}`;
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      const result = await response.json();
      // Assume the API returns an array or an object with a "data" property
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

  // Initial fetch of filter options
  useEffect(() => {
    fetchSellers();
    fetchSellerCategories();
    fetchArticleNames();
    fetchCategories();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0);
  }, [startDate, endDate, selectedSellers, selectedSellerCategories, selectedArticleNames, selectedCategories]);

  // Fetch data when pagination or filters change
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
          SHITJET SIPAS RENDITJES SASISE / CMIMIT 
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
      <TableContainer mt={6} borderRadius="lg" boxShadow="md" bg=".700" p={4}>
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
            <Th fontSize={{ base: "sm", md: "md" }}>Rank</Th>
                  <Th fontSize={{ base: "sm", md: "md" }}>Article Name</Th>
                  <Th fontSize={{ base: "sm", md: "md" }}>Total Quantity Sold</Th>
                  <Th fontSize={{ base: "sm", md: "md" }}>Total Article Price (ALL)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <Tr key={idx}>
                  <Td>{idx + 1}</Td>
                  <Td>{item.Article_Name}</Td>
                  <Td>{item.total_quantity?.toLocaleString() || '-'}</Td>
                  <Td fontSize={{ base: "xs", md: "sm" }}>
                        {item.total_price ? Number(item.total_price).toLocaleString() : '-'} ALL
                      </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={4} textAlign="center" color="white">
                  No Data Available
                </Td>
              </Tr>
            )}
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

export default MostSoldItemsByPrice;
