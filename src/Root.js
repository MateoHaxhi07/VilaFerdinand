import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import App from './App.js';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
// Import your new page component
import MostSoldItemsByPrice from './pages/MostSoldItemsByPrice';
import DailyExpenses from './pages/DailyExpenses'; // Import the DailyExpenses component
import DailyExpensesTable from './pages/DailyExpensesTable'; // Import the DailyExpenses component

const Root = () => (
  <ChakraProvider>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="home" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* New route for the new page */}
        <Route path="most-sold-items-by-price" element={<MostSoldItemsByPrice />} />
        <Route path="daily-expenses" element={<DailyExpenses />} /> {/* Add a route for the DailyExpenses component */}
        <Route path="daily-expenses-table" element={<DailyExpensesTable />} /> {/* Add a route for the DailyExpenses component */}
      </Route>
    </Routes>
  </ChakraProvider>
);

export default Root;
