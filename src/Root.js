// Root.js - Main Routing Configuration
// This file sets up client-side routing using React Router v6 and provides Chakra UI for styling.
// It includes both public routes (accessible without authentication) and protected routes (which require a valid token and proper role).

import { ChakraProvider } from '@chakra-ui/react'; // Provides Chakra UI theme and styling to your app
import { Routes, Route, Navigate } from 'react-router-dom'; // Routing components from React Router v6
import App from './App'; // Your main layout component which likely contains shared UI (e.g., header, sidebar)
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
import ProtectedRoute from './pages/Login_Page/ProtectedRoute.jsx'; // Component that checks allowed roles and redirects if not authorized

// The Root component is the entry point for routing
const Root = () => {
  // Check for a token in localStorage to determine if the user is authenticated
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    // ChakraProvider wraps the entire app to provide Chakra UI's styling and theme
    <ChakraProvider>
      {/* Routes container holds all route definitions */}
      <Routes>

        {/* -------------------------
            Public Routes
            -------------------------
            These routes are accessible without any authentication.
        */}
        <Route path="/login" element={<Login />} /> {/* Login page */}
        <Route path="/not-authorized" element={<NotAuthorized />} /> {/* Page displayed when access is denied */}
        {/* 
          Optionally, you can create a public landing page route for "/" if needed.
          For example, if you want the API welcome message to be public, you might use:
          <Route path="/welcome" element={<WelcomePage />} />
          Here, we’re not using the root route for public content.
        */}

        {/* -------------------------
            Protected Routes
            -------------------------
            These routes require the user to be authenticated. If not, they are redirected to /login.
            They are also wrapped in a ProtectedRoute component which checks if the user's role is allowed.
        */}
        <Route element={isAuthenticated ? <App /> : <Navigate to="/login" />}>
          {/* /home: accessible to users with role 'admin' or 'economist' */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Home />
              </ProtectedRoute>
            }
          />
          {/* /dashboard: accessible to 'admin' and 'economist' */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* /most-sold-items-by-price: accessible to 'admin' and 'economist' */}
          <Route
            path="/most-sold-items-by-price"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <MostSoldItemsByPrice />
              </ProtectedRoute>
            }
          />
          {/* /daily-expenses: accessible to 'admin' and 'economist' */}
          <Route
            path="/daily-expenses"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <DailyExpenses />
              </ProtectedRoute>
            }
          />
          {/* /supplier: accessible to 'admin' and 'economist'
              Note: Corrected typo ' ecomonist' to 'economist'
          */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles={['admin', 'economist']}>
                <Supplier />
              </ProtectedRoute>
            }
          />
          {/* /article-ingredients: accessible only to 'admin' */}
          <Route
            path="/article-ingredients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ArticleIngredients />
              </ProtectedRoute>
            }
          />
          {/* /usage: accessible only to 'admin' */}
          <Route
            path="/usage"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Usage />
              </ProtectedRoute>
            }
          />
          {/* /missing-articles: accessible only to 'admin' */}
          <Route
            path="/missing-articles"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MissingArticles />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* -------------------------
            Fallback Route
            -------------------------
            Any route that doesn't match the above definitions will redirect the user to /login.
        */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </ChakraProvider>
  );
};

export default Root;
