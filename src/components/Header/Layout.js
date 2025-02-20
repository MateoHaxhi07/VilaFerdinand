// src/components/Layout.js
import React, { useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './index.js'; // Assumes Header is exported from src/components/Header/index.js

const Layout = () => {
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
      {/* Render nested routes */}
      <Box mt={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
