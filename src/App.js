import { useState } from 'react';
import { useBreakpointValue, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
// Remove Header import
import FooterNav from './components/Footer/index.js'; // <-- import your footer here

const smVariant = { navigation: 'drawer', navigationButton: true };
const mdVariant = { navigation: 'sidebar', navigationButton: false };

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const variants = useBreakpointValue({ base: smVariant, md: mdVariant });
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Global date/filter states ...
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedSellers, setSelectedSellers] = useState([]);
  const [selectedSellerCategories, setSelectedSellerCategories] = useState([]);
  const [selectedArticleNames, setSelectedArticleNames] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <Box>
      <Box p="5" overflowY="auto" height="100vh">
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
      {/* Now render the Footer at the bottom */}
      <FooterNav />
    </Box>
  );
}
