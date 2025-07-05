import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { ImSpinner2 } from "react-icons/im";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import categoryServices from "../../services/category/categoryServices";
import AddEditCategory from "./AddEditCategory";

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const token = useSelector((state) => state.user.token) || localStorage.getItem("token");

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoryServices.getCategories();
            setCategories(response.data?.data || []);
            showToast("success", "Categories fetched successfully!");
        } catch (error) {
            console.error("Error fetching categories:", error.response?.data || error.message);
            showToast("error", "Error fetching categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const idsToDelete = categoryToDelete ? [categoryToDelete._id] : selectedCategories;
        try {
            await Promise.all(idsToDelete.map(id => categoryServices.deleteCategory(id, token)));
            setCategories(prev => prev.filter(cat => !idsToDelete.includes(cat._id)));
            showToast("success", `${idsToDelete.length} category(s) deleted successfully!`);
            setSelectedCategories([]);
        } catch (error) {
            console.error("Error deleting category:", error.response?.data || error.message);
            showToast("error", "Error deleting categories.");
        } finally {
            setShowConfirmModal(false);
            setCategoryToDelete(null);
        }
    };


    useEffect(() => {
        fetchCategories();
    }, []);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    return (
        <div className="lg:p-12">
            <ToastComponent />

            <div className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-semibold">Categories</h2>
                <div className="flex gap-4">
                    {selectedCategories.length > 0 && (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="bg-white text-black border border-black px-2 py-2 rounded-md"
                        >
                            Delete Selected ({selectedCategories.length})
                        </button>
                    )}
                    <button
                        className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2"
                        onClick={() => {
                            setShowModal(true);
                            setIsEditing(false);
                            setSelectedCategory(null);
                        }}
                    >
                        <FaPlus /> Add Category
                    </button>
                </div>
            </div>


            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <ImSpinner2 className="text-4xl text-black animate-spin" />
                </div>
            ) : (
                <>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.length === currentCategories.length && currentCategories.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedCategories(currentCategories.map(cat => cat._id));
                                            } else {
                                                setSelectedCategories([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="p-4">S. No</th>
                                <th className="p-4">Menu Items</th>
                                <th className="p-4">Category Name</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCategories.map((category, index) => (
                                <tr key={category._id || index} className="border-b">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category._id)}
                                            onChange={() => {
                                                setSelectedCategories((prev) =>
                                                    prev.includes(category._id)
                                                        ? prev.filter((id) => id !== category._id)
                                                        : [...prev, category._id]
                                                );
                                            }}
                                        />
                                    </td>
                                    <td className="p-4 text-center">{indexOfFirstItem + index + 1}</td>
                                    <td className="p-4 text-center font-semibold">
                                        {category.items[0]?.itemName || "No Item"}
                                    </td>
                                    <td className="p-4 text-center font-semibold">{category.categoryName}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button
                                                className="text-green-500 hover:text-green-800"
                                                onClick={() => {
                                                    setShowModal(true);
                                                    setIsEditing(true);
                                                    setSelectedCategory(category);
                                                }}
                                            >
                                                <FaEdit size={20} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-800"
                                                onClick={() => {
                                                    setCategoryToDelete(category);
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

                    {categories.length > itemsPerPage && (
                        <div className="sticky bottom-0 bg-white border-t mt-6 py-3 flex justify-between items-center ">
                            <p className="text-sm text-gray-600 pl-4">
                                Showing {indexOfFirstItem + 1} to{" "}
                                {Math.min(indexOfLastItem, categories.length)} of {categories.length} categories
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
                    )}

                </>
            )}

            {/* Confirmation Modal for Deleting */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                        <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
                        <p className="text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="bg-gray-300 px-6 py-2 rounded-sm"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-black text-white px-6 py-2 rounded-sm"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Category Modal */}
            <AddEditCategory
                showModal={showModal}
                setShowModal={setShowModal}
                isEditing={isEditing}
                selectedCategory={selectedCategory}
                refreshCategories={fetchCategories}
            />
        </div>
    );
};

export default Category;  