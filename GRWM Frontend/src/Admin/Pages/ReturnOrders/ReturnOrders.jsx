import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";

const ReturnOrders = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");

  const fetchReturnOrders = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/all-return-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReturns(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch return orders", err);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    try {
      setApprovingId(id);
      await axios.put(
        `${BASE_URL}/return-request/${id}/status`,
        { status: "Approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Refresh the list after approval
      fetchReturnOrders();
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        All Return Requests ({returns.length})
      </h2>

      {returns.length === 0 ? (
        <div className="text-center text-gray-500">
          No return requests found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-md">
          <table className="min-w-full table-auto text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Product</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Screenshot</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((item, index) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <div className="font-semibold">
                      {item.productId?.title || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      ₹{item.productId?.price || "N/A"}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{item.customerName}</div>
                    <div className="text-xs text-gray-500">{item.email}</div>
                    <div className="text-xs text-gray-500">
                      {item.phoneNumber}
                    </div>
                  </td>
                  <td className="p-3">
                    {item.requestTo?.name || "N/A"}
                    <div className="text-xs text-gray-500">
                      {item.requestTo?.email}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>{item.reason}</div>
                    {item.productDescription && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.productDescription}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    {item.paymentScreenshots?.length > 0 ? (
                      <img
                        src={`${item.paymentScreenshots[0]}`}
                        alt="screenshot"
                        className="w-14 h-14 rounded object-cover border"
                      />
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="p-3">
                    {item.status === "Pending" ? (
                      <button
                        onClick={() => approveRequest(item._id)}
                        disabled={approvingId === item._id}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {approvingId === item._id ? "Approving..." : "Approve"}
                      </button>
                    ) : (
                      <span className="text-green-600 font-semibold text-sm">
                        {item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;
