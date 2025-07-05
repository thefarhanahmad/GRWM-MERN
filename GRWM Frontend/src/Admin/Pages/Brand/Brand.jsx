import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { ImSpinner2 } from "react-icons/im";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaExclamationTriangle,
  FaUpload,
} from "react-icons/fa";
import brandServices from "../../services/brand/brandServices";

const Brand = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brandData, setBrandData] = useState({ brandName: "", brandLogo: null });
  const [previewImage, setPreviewImage] = useState(null);
  const dropRef = useRef();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const token = useSelector((state) => state.user?.token) || localStorage.getItem("token");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await brandServices.getBrands();
        setBrands(response.data || []);
        setFilteredBrands(response.data || []);
        showToast("success", "Brands fetched successfully!");
      } catch (error) {
        showToast("error", "Error fetching brands.");
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const handleFileChange = (file) => {
    setBrandData((prev) => ({ ...prev, brandLogo: file }));
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brandData.brandName || (!brandData.brandLogo && !isEditing)) {
      showToast("error", "All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("brandName", brandData.brandName);
    if (brandData.brandLogo) formData.append("brandLogo", brandData.brandLogo);

    try {
      if (isEditing) {
        await brandServices.updateBrand(selectedBrand, formData, token);
        showToast("success", "Brand updated successfully!");
      } else {
        await brandServices.addBrand(formData, token);
        showToast("success", "Brand added successfully!");
      }

      const response = await brandServices.getBrands();
      setBrands(response.data || []);
      setFilteredBrands(response.data || []);

      setShowModal(false);
      setIsEditing(false);
      setBrandData({ brandName: "", brandLogo: null });
      setPreviewImage(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error saving brand.";
      showToast("error", errorMessage);
    }
  };

  const handleEditClick = (brand) => {
    setSelectedBrand(brand._id);
    setBrandData({ brandName: brand.brandName, brandLogo: null });
    setPreviewImage(brand.brandLogo);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      await brandServices.deleteBrand(selectedBrand, token);
      showToast("success", "Brand deleted successfully!");

      const response = await brandServices.getBrands();
      setBrands(response.data || []);
      setFilteredBrands(response.data || []);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting brand.";
      showToast("error", errorMessage);
    } finally {
      setShowConfirmModal(false);
      setSelectedBrand(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  return (
    <div className="lg:p-12">
      <ToastComponent />
      <div className="mb-10 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Brands</h2>
        <button
          className="bg-black text-white px-6 py-2 rounded-md text-md flex items-center gap-2 transition"
          onClick={() => {
            setShowModal(true);
            setIsEditing(false);
            setBrandData({ brandName: "", brandLogo: null });
            setPreviewImage(null);
          }}
        >
          <FaPlus /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <ImSpinner2 className="text-4xl text-black animate-spin" />
        </div>
      ) : (
        <>
          <table className="w-full bg-white border rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">S.No</th>
                <th className="p-4">Brand Logo</th>
                <th className="p-4">Brand Name</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBrands.map((brand, index) => (
                <tr key={brand._id || index} className="border-b">
                  <td className="p-2 text-center">{indexOfFirstItem + index + 1}</td>
                  <td className="p-2 text-center">
                    <img src={brand.brandLogo} alt={brand.brandName} className="w-16 h-16 object-contain mx-auto" />
                  </td>
                  <td className="p-2 text-center font-semibold">{brand.brandName}</td>
                  <td className="p-2 text-center">
                    <div className="flex justify-center items-center gap-4">
                      <button className="text-green-500 hover:text-green-800" onClick={() => handleEditClick(brand)}>
                        <FaEdit size={20} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-800"
                        onClick={() => {
                          setSelectedBrand(brand._id);
                          setShowConfirmModal(true);
                        }}
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sticky bottom-0 bg-white border-t mt-6 py-3 flex justify-between items-center z-10">
            <p className="text-sm text-gray-600 pl-4">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBrands.length)} of {filteredBrands.length} brands
            </p>
            <div className="flex gap-6 pr-4">
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

        </>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg w-96 relative">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowModal(false)}>
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Brand" : "Add New Brand"}</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                  value={brandData.brandName}
                  onChange={(e) => setBrandData({ ...brandData, brandName: e.target.value })}
                />
              </div>

              <div
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-black transition relative"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                ref={dropRef}
              >
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-28 h-28 mx-auto object-contain mb-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                    <FaUpload size={24} />
                    <p>Drag & Drop or Click to Upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                />
              </div>

              <button type="submit" className="bg-black text-white px-6 py-2 rounded-md w-full mt-4 transition">
                {isEditing ? "Update Brand" : "Add Brand"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Confirm Delete <FaExclamationTriangle size={22} className="text-red-500" />
            </h2>
            <p>Are you sure you want to delete this brand?</p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md"
                onClick={handleDeleteBrand}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brand;
