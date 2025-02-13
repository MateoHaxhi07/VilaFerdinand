// App.js
import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header/index.js';
import Footer from './components/Footer/index.js';

export default function App() {
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
      <Header />
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
    </>
  );
}