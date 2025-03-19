// Root.js
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home_Page/Home.js';
import Dashboard from './pages/Shitjet_Analitike/Dashboard.jsx';
import MostSoldItemsByPrice from './pages/Shitjet_Renditura/MostSoldItemsByPrice';
import DailyExpenses from './pages/Xhiro_Ditore/DailyExpenses.js'; // We keep the import, but won't directly use it here
import Supplier from './pages/Furnitor/Supplier.js';
import ArticleIngredients from './pages/Receta/ArticleIngredients.js';
import Usage from './pages/Malli_Shitur/Usage.js';
import MissingArticles from './pages/Receta_Mungojn/MissingArticles.js';
import Login from './pages/Login_Page/Login';
import NotAuthorized from './pages/Login_Page/NotAuthorized';
import ProtectedRoute from './pages/Login_Page/ProtectedRoute.jsx';
import Inventory from './pages/Inventory/Inventory.js';

// Layout with sidebar
import Layout from './components/Sidebar/Layout.js';

// 1) Import the new wrapper & the mobile version
import DailyExpensesWrapper from './pages/Xhiro_Ditore/DailyExpensesWrapper.js';
import DailyExpensesMobile from './pages/Xhiro_Ditore/DailyExpensesMobile.js';

const Root = () => {
  // Check for a token in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ChakraProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected Routes - wrap them in <Layout> */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          {/* /home */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Shitjet Analitike => /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Shitjet Renditura => /most-sold-items-by-price */}
          <Route
            path="/most-sold-items-by-price"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <MostSoldItemsByPrice />
              </ProtectedRoute>
            }
          />

          {/* 2) Add a brand-new route for the MOBILE version */}
          <Route
            path="/daily-expenses-mobile"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <DailyExpensesMobile />
              </ProtectedRoute>
            }
          />

          {/* 3) Use the WRAPPER for /daily-expenses, which detects mobile */}
          <Route
            path="/daily-expenses"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <DailyExpensesWrapper />
              </ProtectedRoute>
            }
          />

          {/* More protected routes */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Supplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/article-ingredients"
            element={
              <ProtectedRoute allowedRoles={['admin','economist']}>
                <ArticleIngredients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute allowedRoles={['admin','economist']}>
                <Usage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missing-articles"
            element={
              <ProtectedRoute allowedRoles={['admin','economist']}>
                <MissingArticles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Inventory />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ChakraProvider>
  );
};

export default Root;
