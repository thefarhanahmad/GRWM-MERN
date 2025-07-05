import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Loader } from "lucide-react";
import { useSelector } from "react-redux";

const ProductManagements = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const token =
    useSelector((state) => state.user?.token) || localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, product: null });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/show-all-products?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setProducts(response.data.data);
        setTotal(response.data.totalProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!modal.product) return;
    try {
      await axios.delete(`${baseUrl}/product-dlt/${modal.product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ open: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  return (
    <div className="p-2 md:p-10 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>

        {!loading && (
          <div className="bg-white px-6 py-2 rounded-md border border-black shadow-md">
            <h2 className="text-lg font-medium text-gray-700">
              Products:{" "}
              <span className="text-black font-bold">{total}</span>
            </h2>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600">
          <Loader className="animate-spin inline mr-2" />
          Loading products...
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-gray-300 rounded-md mb-6">
            <table className="min-w-[900px] w-full bg-white">
              <thead className="bg-gray-200 text-black uppercase text-sm">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.image || "https://via.placeholder.com/60"}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded border"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-semibold">
                      ₹{product.price}
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">
                      <div>{product.vendorName}</div>
                      <div className="text-xs text-gray-500">
                        {product.vendorEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setModal({ open: true, product })}
                        className="px-3 py-1 text-xs rounded-md bg-red-600 text-white flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} products
              </p>
              <div className="flex gap-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="px-4 py-1 border border-black rounded-full disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-4 py-1 border border-black rounded-full disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {modal.open && modal.product && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">Delete Product</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete product{" "}
              <strong>{modal.product.name}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setModal({ open: false, product: null })}
                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={deleteProduct}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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

export default ProductManagements;
