import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Ban, CheckCircle, Loader } from "lucide-react";
import { useSelector } from "react-redux";

const UserManagements = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: "", user: null });

  const limit = 10;

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/all-users?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.totalUsers);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(response.data.data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!modal.user) return;

    try {
      if (modal.type === "block") {
        await axios.put(
          `${baseUrl}/user/${modal.user._id}/toggle-block`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else if (modal.type === "delete") {
        await axios.delete(`${baseUrl}/user/${modal.user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setModal({ open: false, type: "", user: null });
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-6 px-4">
      <p className="text-sm text-gray-600">
        Showing {(currentPage - 1) * limit + 1} to{" "}
        {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
      </p>
      <div className="flex gap-4">
        <button
          className="px-4 py-1 border border-black rounded-full disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <button
          className="px-4 py-1 border border-black rounded-full disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-2 md:p-10  min-h-screen">
      <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>

        {!loading && (
          <div className="bg-white px-6 py-2 rounded-md border border-black shadow-md">
            <h2 className="text-lg font-medium text-gray-700">
              Users:{" "}
              <span className="text-black font-bold">{totalUsers}</span>
            </h2>
          </div>
        )}
      </div>


      {loading ? (
        <div className="text-center py-20 text-gray-600">
          <Loader className="animate-spin inline mr-2" />
          Loading users...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-300 rounded-md">
            <table className="min-w-[800px] w-full">

              <thead>
                <tr className="bg-gray-200">
                  <th className="p-4 text-left">Profile</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Earnings</th>
                  <th className="p-4 text-left">Orders</th>
                  <th className="p-4 text-left">Blocked</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {user.profile ? (
                        <img
                          src={user.profile}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-black flex items-center justify-center font-semibold text-sm uppercase">
                          {(user.name || user.email || "U")[0]}
                        </div>
                      )}
                    </td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.phone || "-"}</td>
                    <td className="p-4 text-green-700 font-semibold">
                      ₹{user.totalEarning || 0}
                    </td>
                    <td className="p-4 space-y-1">
                      {Object.entries(user.deliveryStats || {}).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            {status}: {count}
                          </div>
                        )
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${user.isBlocked
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                          }`}
                      >
                        {user.isBlocked ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            setModal({ open: true, type: "block", user })
                          }
                          className={`px-3 py-1 text-xs rounded-md flex items-center ${user.isBlocked
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                            }`}
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle size={16} className="mr-1" /> Unblock
                            </>
                          ) : (
                            <>
                              <Ban size={16} className="mr-1" /> Block
                            </>
                          )}
                        </button>

                        <button
                          onClick={() =>
                            setModal({ open: true, type: "delete", user })
                          }
                          className="px-3 py-1 text-xs rounded-md bg-red-600 text-white flex items-center"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}

      {/* Confirmation Modal */}
      {modal.open && modal.user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold mb-4">
              {modal.type === "block"
                ? `${modal.user.isBlocked ? "Unblock" : "Block"} User`
                : "Delete User"}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to{" "}
              <strong className="capitalize">{modal.type}</strong> user{" "}
              <strong>{modal.user.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 px-6 py-2 rounded-sm"
                onClick={() => setModal({ open: false, type: "", user: null })}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 rounded-sm text-white ${modal.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagements;
