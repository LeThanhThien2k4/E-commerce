import "./App.css";
import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Cart from "./components/Cart.jsx";
import AddProduct from "./components/AddProduct";
import Product from "./components/Product";
import Login from "./components/Login";
import Register from "./components/Register";
import OrderHistory from "./components/OrderHistory";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppProvider } from "./context/Context.jsx";
import UpdateProduct from "./components/UpdateProduct";
import PaymentReturn from "./components/PaymentReturn";
import AdminLayout from "./components/AdminLayout";
import AdminProducts from "./components/AdminProducts";
import AdminOrders from "./components/AdminOrders";
import AdminRoute from "./components/AdminRoute";
import Category from "./components/Category";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand("");
    console.log("Selected category:", category);
  };

  const handleBrandSelect = (category, brand) => {
    setSelectedCategory(category);
    setSelectedBrand(brand);
    console.log("Selected brand:", brand, "in category:", category);
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Group 1: Storefront (Khách hàng) */}
          <Route element={
            <>
              <Navbar onSelectCategory={handleCategorySelect} onSearch={() => {}} />
              <Outlet />
            </>
          }>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/category" element={<Category />} />
            <Route
              path="/"
              element={
                <Home 
                  selectedCategory={selectedCategory}
                  selectedBrand={selectedBrand}
                  onClearCategory={() => handleCategorySelect("")}
                  onSelectCategory={handleCategorySelect}
                  onSelectBrand={handleBrandSelect}
                />
              }
            />
            <Route path="/product" element={<Product  />} />
            <Route path="product/:id" element={<Product  />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
          </Route>

          {/* Group 2: Admin Dashboard - Bảo vệ bằng AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminProducts />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="product/add" element={<AddProduct />} />
              <Route path="product/update/:id" element={<UpdateProduct />} />
            </Route>
          </Route>

        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          theme="colored"
        />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;