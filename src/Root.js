// Root.js
import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';

import App from './App';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MostSoldItemsByPrice from './pages/MostSoldItemsByPrice';
import DailyExpenses from './pages/DailyExpenses';
import Supplier from './pages/Supplier';
import ArticleIngredients from './pages/ArticleIngredients';
import Usage from './pages/Usage';
import MissingArticles from './pages/MissingArticles';
import Login from './pages/Login';
import NotAuthorized from './pages/NotAuthorized';
import ProtectedRoute from './pages/ProtectedRoute.jsx';

const Root = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <ChakraProvider>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected Routes nested under App */}
        <Route element={isAuthenticated ? <App /> : <Navigate to="/login" />}>
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
              <ProtectedRoute allowedRoles={['admin',"economist"]}>
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
              <ProtectedRoute allowedRoles={['admin',' ecomonist']}>
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ChakraProvider>
  );
};

export default Root;
