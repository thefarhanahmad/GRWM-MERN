import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const DashboardCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md flex items-center gap-4">
    <div className="bg-blue-100 p-3 rounded-full">
      <Icon className="text-blue-600" />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-semibold">{value}</h2>
    </div>
  </div>
);

const AdminDashboard = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token =
    useSelector((state) => state.user.token) || localStorage.getItem("token");

  const location = useLocation();
  const isMobile = window.innerWidth < 1024;
  const isDashboardPage = location.pathname === "/admin/dashboard";

  // Hide content on mobile if sidebar is open
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/dashboard-analytics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard analytics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [baseUrl]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Final conditional render
  if (isMobile && sidebarOpen && isDashboardPage) {
    return null; // Hide dashboard content
  }

  return (
    <div className="min-h-screen p-2 md:p-10 text-black">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>

      {loading ? (
        <div className="text-center text-gray-600">Loading...</div>
      ) : (
        dashboardData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <DashboardCard title="Total Users" value={dashboardData.totalUsers} icon={Users} />
              <DashboardCard title="Total Orders" value={dashboardData.totalOrders} icon={ShoppingCart} />
              <DashboardCard title="Total Revenue" value={`₹${dashboardData.totalRevenue}`} icon={DollarSign} />
              <DashboardCard title="Total Products" value={dashboardData.totalProducts} icon={Package} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={dashboardData.monthlySales.map((item) => ({
                      month: monthNames[item._id.month - 1],
                      total: item.total,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563EB"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dashboardData.ordersByStatus.map((item) => ({
                      status: item._id,
                      count: item.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
