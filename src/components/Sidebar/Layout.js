// src/components/Sidebar/Layout.js
import React, { useState } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Optional global state for child pages...
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <Box>
      {/* Header with hamburger */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Sidebar: rendered as drawer on mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        variant={variants?.navigation}
      />

      {/* Main content area with onClick to close sidebar if clicking outside */}
      <Box
        pt="60px"
        ml={variants?.navigation === 'sidebar' && isSidebarOpen ? '200px' : '0'}
        transition="margin-left 0.3s ease"
        p="5"
        overflowY="auto"
        height="100vh"
        // If drawer (mobile) is open and the user clicks here, close the sidebar.
        onClick={() => {
          if (variants?.navigation === 'drawer' && isSidebarOpen) {
            setSidebarOpen(false);
          }
        }}
      >
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
}
