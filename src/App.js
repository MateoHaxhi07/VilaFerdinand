// App.js
import { useState } from 'react';
import { useBreakpointValue, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/index.js';
import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Global date state
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Global filter state
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <>
      <Sidebar variant={variants.navigation} isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <Box ml={!variants?.navigationButton && 240}>
        <Header showSidebarButton={variants?.navigationButton} onShowSidebar={toggleSidebar} />
        <Box p="5">
          {/* Pass the global states via Outlet context */}
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
        <Footer />
      </Box>
    </>
  );
}
