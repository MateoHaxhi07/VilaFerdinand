// Root.js - Main Routing Configuration with Layout
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Updated Layout component with header toggle and Outlet
import Home from './pages/Home_Page/Home.js';
import Dashboard from './pages/Shitjet_Analitike/Dashboard.js';
import MostSoldItemsByPrice from './pages/Shitjet_Renditura/MostSoldItemsByPrice.js';
import DailyExpenses from './pages/Xhiro_Ditore/DailyExpenses.js';
import Supplier from './pages/Furnitor/Supplier.js';
import ArticleIngredients from './pages/Receta/ArticleIngredients.js';
import Usage from './pages/Malli_Shitur/Usage.js';
import MissingArticles from './pages/Receta_Mungojn/MissingArticles.js';
import Login from './pages/Login_Page/Login';
import NotAuthorized from './pages/Login_Page/NotAuthorized';
import ProtectedRoute from './pages/Login_Page/ProtectedRoute.jsx';

const Root = () => {
  // Check for a token in localStorage to determine if the user is authenticated
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ChakraProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected Routes wrapped with Layout */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/most-sold-items-by-price"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <MostSoldItemsByPrice />
              </ProtectedRoute>
            }
          />
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
              <ProtectedRoute allowedRoles={['admin']}>
                <ArticleIngredients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Usage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missing-articles"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MissingArticles />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ChakraProvider>
  );
};

export default Root;
