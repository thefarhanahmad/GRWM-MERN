import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Pie } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js

const Balance = () => {
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vendor earnings from API
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axios.get(`${baseUrl}/vendor-earnings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Earning response:", response.data);
        setEarnings(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch earnings.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEarnings();
    }
  }, [baseUrl, token]);

  // Show loading or error before rendering UI
  if (loading)
    return <div className="text-center text-gray-600">Loading earnings...</div>;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;

  // Pie Chart Data
  const pieData = {
    labels: ["Total Earnings", "Weekly Earnings", "Monthly Earnings"],
    datasets: [
      {
        data: [
          earnings.totalEarnings,
          earnings.weeklyEarnings,
          earnings.monthlyEarnings,
        ],
        backgroundColor: ["#1E293B", "#64748B", "#CBD5E1"], // Dark to light shades
        hoverBackgroundColor: ["#334155", "#94A3B8", "#E2E8F0"],
        borderWidth: 2,
      },
    ],
  };

  // Pie Chart Options
  const pieOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#000",
        },
      },
    },
  };

  return (
    <div className="bg-white min-h-screen p-3 sm:p-6 lg:px-16">
      <h2 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Earnings Overview
      </h2>

      {/* Earnings Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">
            Total Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{earnings.totalEarnings}
          </p>
        </div>
        <div className="bg-gray-200 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">
            Weekly Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{earnings.weeklyEarnings}
          </p>
        </div>
        <div className="bg-gray-300 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-600">
            Monthly Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{earnings.monthlyEarnings}
          </p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-gray-100 p-3 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 text-center mb-4">
          Earnings Distribution
        </h3>
        <div className="flex justify-center">
          <div className="w-80 h-80">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Balance;
