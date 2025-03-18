// Root.js
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home_Page/Home.js';
import Dashboard from './pages/Shitjet_Analitike/Dashboard.jsx';
import MostSoldItemsByPrice from './pages/Shitjet_Renditura/MostSoldItemsByPrice';
import DailyExpenses from './pages/Xhiro_Ditore/DailyExpenses.js';
import Supplier from './pages/Furnitor/Supplier.js';
import ArticleIngredients from './pages/Receta/ArticleIngredients.js';
import Usage from './pages/Malli_Shitur/Usage.js';
import MissingArticles from './pages/Receta_Mungojn/MissingArticles.js';
import Login from './pages/Login_Page/Login';
import NotAuthorized from './pages/Login_Page/NotAuthorized';
import ProtectedRoute from './pages/Login_Page/ProtectedRoute.jsx';
import Inventory from './pages/Inventory/Inventory.js';

// Import the new Layout (with sidebar)
import Layout from './components/Sidebar/Layout.js';

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
          {/* Example: /home route */}
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

          {/* More protected routes */}
          <Route
            path="/daily-expenses"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <DailyExpenses />
              </ProtectedRoute>
            }
          />
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
