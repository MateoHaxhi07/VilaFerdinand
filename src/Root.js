import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import App from './App.js';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
// Import your new page component
import MostSoldItemsByPrice from './pages/MostSoldItemsByPrice';

const Root = () => (
  <ChakraProvider>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* New route for the new page */}
        <Route path="most-sold-items-by-price" element={<MostSoldItemsByPrice />} />
      </Route>
    </Routes>
  </ChakraProvider>
);

export default Root;
