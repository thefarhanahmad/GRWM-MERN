import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AdminDashboard from "./Admin/Pages/Dashboard/AdminDashboard";
import Sidebar from "./components/AdminNavbar/Sidebar";
import AdminNavbar from "./components/AdminNavbar/AdminNavbar";
import Brand from "./Admin/Pages/Brand/Brand";
import Slider from "./Admin/Pages/Slider/Slider";
import Category from "./Admin/Pages/Category/Category";
import SubCategory from "./Admin/Pages/SubCategory/SubCategory";
import Menu from "./Admin/Pages/Menu/Menu";
import UserManagements from "./Admin/Pages/UserManagement/UserManagements";
import ProductManagements from "./Admin/Pages/productManagements/ProductManagements";
import ReturnOrders from "./Admin/Pages/ReturnOrders/ReturnOrders";

const AdminPages = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDashboard = location.pathname === "/admin/dashboard";
  const shouldHideRightPanel = isSidebarOpen && isMobile && isDashboard;

  return (
    <div className="lg:flex">
      {/* Sidebar */}
      <div
        className={`h-screen fixed left-0 top-0 z-50 ${
          isSidebarOpen ? "lg:w-72" : "lg:w-20"
        } transition-all duration-300`}
      >
        <Sidebar toggleSidebar={setIsSidebarOpen} />
      </div>

      {/* Right Side */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-72" : "lg:ml-20"
        } ${shouldHideRightPanel ? "hidden" : "block"}`}
      >
        <AdminNavbar />
        <div className="p-4">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="brand" element={<Brand />} />
            <Route path="categories" element={<Category />} />
            <Route path="subcategories" element={<SubCategory />} />
            <Route path="slider" element={<Slider />} />
            <Route path="menu" element={<Menu />} />
            <Route path="users" element={<UserManagements />} />
            <Route path="products" element={<ProductManagements />} />
            <Route path="return-orders" element={<ReturnOrders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
