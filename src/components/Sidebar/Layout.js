// src/components/Sidebar/Layout.js
import React, { useState } from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

export default function Layout() {
  // ----------------------------
  // 1) SIDEBAR State Management
  // ----------------------------
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // REMOVED: const sidebarRef = useRef(null);

  // Chakra UI breakpoint logic
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });

  const toggleSidebar = () => {
    console.log('[Layout] toggleSidebar called, isSidebarOpen =', isSidebarOpen);
    setSidebarOpen(!isSidebarOpen);
  };

  // REMOVED this entire outside-click logic:
  /*
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);
  */

  // ----------------------------
  // 2) FILTERS State Management
  // ----------------------------
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    console.log('[Layout] toggleFilters called, showFilters =', showFilters);
    setShowFilters(!showFilters);
  };

  // ----------------------------
  // 3) Global States for Child Pages
  // ----------------------------
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([
    { value: 'Bar', label: 'Bar' },
    { value: 'Restaurant', label: 'Restaurant' },
    { value: 'Delivery', label: 'Delivery' },
  ]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  console.log(
    '[Layout] Rendering... isSidebarOpen =',
    isSidebarOpen,
    'variant =',
    variants?.navigation
  );

  return (
    <Box>
      {/* ----------------------------
          (A) Fixed Header 
          ----------------------------
          We pass:
          - onToggleSidebar => so the hamburger can open/close the sidebar
          - onToggleFilters => so the "Show Filters" button can toggle filters
          - showFilters    => so the header button text can say "Hide" or "Show"
        */}
      <Header
        onToggleSidebar={toggleSidebar}
        onToggleFilters={toggleFilters}
        showFilters={showFilters}
      />

      {/* ----------------------------
          (B) Sidebar
          ----------------------------
          It's hidden as a drawer on small screens or a sidebar on larger screens.
          We pass:
          - isOpen: whether sidebar is shown
          - onClose: function to close it
          - variant: 'drawer' or 'sidebar' 
        */}
      <Sidebar
        // REMOVED ref={sidebarRef}
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        variant={variants?.navigation}
      />

      {/* ----------------------------
          (C) Main Content Area
          ---------------------------- 
          - We add top padding so content isn't hidden under the 60px fixed header
          - If it's a 'sidebar' variant and it's open, we shift content to the right
            (width ~ 350px since you set w="350px" in your Sidebar)
        */}
      <Box
        pt="60px"
        ml={variants?.navigation === 'sidebar' && isSidebarOpen ? '350px' : '0'}
        transition="margin-left 0.3s ease"
        p="5"
        overflowY="auto"
        height="100vh"
      >
        {/* (D) The child routes (pages) will be rendered here via <Outlet>. */}
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
            showFilters,
            setShowFilters,
          }}
        />
      </Box>
    </Box>
  );
}
