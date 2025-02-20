// src/components/Layout.js
import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './index.js'; // Assumes Header is exported from src/components/Header/index.js

const Layout = () => {
  // Provide the expected context values.
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [showHeader, setShowHeader] = useState(true);

  return (
    <Box>
      {/* Toggle Button */}
      <Button
        onClick={() => setShowHeader(prev => !prev)}
        mt={4}
        ml={4}
        colorScheme="teal"
        variant="outline"
      >
        {showHeader ? "Hide Header" : "Show Header"}
      </Button>
      {/* Conditionally render Header */}
      {showHeader && <Header />}
      <Box mt={4}>
        {/* Pass the context to nested routes */}
        <Outlet
          context={{
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
          }}
        />
      </Box>
    </Box>
  );
};

export default Layout;