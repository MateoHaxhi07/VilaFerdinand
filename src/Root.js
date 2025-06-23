// Root.js
import { ChakraProvider } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  RendituraFullPage,
  FullFunnelChart,
  ShitjetAnalitikeFullPage,
} from "./pages/Home_Page/Home.js";
import Home from "./pages/Home_Page/Home.js";


import DailyExpenses from "./pages/Xhiro_Ditore/DailyExpenses.js";
import Supplier from "./pages/Furnitor/Supplier.js";
import ArticleIngredients from "./pages/Receta/ArticleIngredients.js";
import Usage from "./pages/Malli_Shitur/Usage.js";
import MissingArticles from "./pages/Receta_Mungojn/MissingArticles.js";
import Login from "./pages/Login_Page/Login";
import NotAuthorized from "./pages/Login_Page/NotAuthorized";
import ProtectedRoute from "./pages/Login_Page/ProtectedRoute.jsx";
import Inventory from "./pages/Inventory/Inventory.js";


// Layout with sidebar
import Layout from "./components/Sidebar/Layout.js";

// 1) Import the new wrapper & the mobile version
import DailyExpensesWrapper from "./pages/Xhiro_Ditore/DailyExpensesWrapper.js";
import DailyExpensesMobile from "./pages/Xhiro_Ditore/DailyExpensesMobile.js";

const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  // Dummy data for categoryTreemapData
  const categoryTreemapData = [
    { Category: "Pizza", total_price: "12000" },
    { Category: "Burger", total_price: "8000" },
    { Category: "Pasta", total_price: "6000" },
    { Category: "Salad", total_price: "4000" },
    { Category: "Dessert", total_price: "3000" },
    { Category: "Drinks", total_price: "5000" },
    { Category: "Sushi", total_price: "7000" },
    { Category: "Steak", total_price: "11000" },
    { Category: "Sandwich", total_price: "3500" },
    { Category: "Soup", total_price: "2500" },
  ];

  return (
    <ChakraProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          {/* /home */}
          <Route
            path="/home"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <Home />
              </ProtectedRoute>
            }
          />



          {/* daily-expenses-mobile */}
          <Route
            path="/daily-expenses-mobile"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <DailyExpensesMobile />
              </ProtectedRoute>
            }
          />

          {/* daily-expenses => wrapper */}
          <Route
            path="/daily-expenses"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <DailyExpensesWrapper />
              </ProtectedRoute>
            }
          />

<Route
  path="/renditura-full"
  element={
    <ProtectedRoute allowedRoles={["admin", "economist"]}>
      <RendituraFullPage />
    </ProtectedRoute>
  }
/>

          {/* SHITJET ANALITIKE FULL PAGE (the new route) */}
          <Route
            path="/shitjet-analitike-full"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <ShitjetAnalitikeFullPage />
              </ProtectedRoute>
            }
          />

          {/* more protected routes */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <Supplier />
              </ProtectedRoute>
            }
          />
          <Route
            path="/article-ingredients"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <ArticleIngredients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <Usage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/missing-articles"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <MissingArticles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* Full funnel chart */}
          <Route
            path="/full-funnel"
            element={
              <ProtectedRoute allowedRoles={["admin", "economist"]}>
                <FullFunnelChart data={categoryTreemapData} />
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
