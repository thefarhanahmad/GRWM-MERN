import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { ImSpinner2 } from "react-icons/im";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import subCategoryServices from "../../services/subCategory/subCategoryServices";
import categoryServices from "../../services/category/categoryServices";
import AddEditSubCategory from "./AddEditSubCategory";

const SubCategory = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);
    const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const token = useSelector((state) => state.user.token) || localStorage.getItem("token");

    const fetchData = async () => {
        setLoading(true);
        try {
            const subCategoriesRes = await subCategoryServices.getSubCategories();
            const categoriesRes = await categoryServices.getCategories();
            setSubCategories(Array.isArray(subCategoriesRes.data) ? subCategoriesRes.data : []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showToast("error", "Error fetching data.");
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteCategory = async () => {
        try {
            // If selecting all subcategories across pages
            const idsToDelete = isAllSelected ? subCategories.map(sc => sc._id) : selectedSubCategoryIds;

            if (idsToDelete.length > 0) {
                // Perform deletion for all selected IDs
                await Promise.all(idsToDelete.map(id => subCategoryServices.deleteSubCategory(id, token)));

                // Update subCategories state by removing the deleted subcategories
                setSubCategories(prevSubCategories => prevSubCategories.filter(sc => !idsToDelete.includes(sc._id)));

                showToast("success", `${idsToDelete.length} Subcategory(ies) deleted successfully!`);
            } else {
                showToast("error", "No subcategory selected for deletion.");
            }

            // Reset states after deletion
            setShowConfirmModal(false);
            setSelectedSubCategoryIds([]);
            setIsAllSelected(false);
        } catch (error) {
            console.error("Error deleting subcategory:", error);
            showToast("error", "Error deleting subcategory(ies).");
            setShowConfirmModal(false);
        }
    };



    useEffect(() => {
        fetchData();
    }, []);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSubCategories = subCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(subCategories.length / itemsPerPage);

    return (
        <div className="lg:p-12">
            <ToastComponent />
            <div className="mb-10 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">SubCategories</h2>
                <div className="flex gap-4">
                    {selectedSubCategoryIds.length > 0 && (
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="bg-white text-black border border-black px-2 py-2 rounded-md"
                        >
                            Delete Selected ({selectedSubCategoryIds.length})
                        </button>
                    )}
                    <button
                        className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2"
                        onClick={() => {
                            setShowModal(true);
                            setIsEditing(false);
                            setSelectedSubCategory(null);
                        }}
                    >
                        <FaPlus /> Add SubCategory
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
                                        checked={isAllSelected}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setIsAllSelected(checked);
                                            setSelectedSubCategoryIds(checked ? subCategories.map(sc => sc._id) : []);
                                        }}
                                    />

                                </th>
                                <th className="p-4">S. No</th>
                                <th className="p-4">SubCategory Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentSubCategories.map((subcategory, index) => (
                                <tr key={subcategory._id || index} className="border-b">
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubCategoryIds.includes(subcategory._id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                if (checked) {
                                                    setSelectedSubCategoryIds((prev) => [...prev, subcategory._id]);
                                                } else {
                                                    setSelectedSubCategoryIds((prev) =>
                                                        prev.filter((id) => id !== subcategory._id)
                                                    );
                                                    setIsAllSelected(false);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="p-4 text-center">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="p-4 text-center font-semibold">
                                        {subcategory.subcategoryName}
                                    </td>
                                    <td className="p-4 text-center font-semibold">
                                        {subcategory.category ? subcategory.category.categoryName : "No Category"}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center items-center gap-4">
                                            <button
                                                className="text-green-500 hover:text-green-800"
                                                onClick={() => {
                                                    setShowModal(true);
                                                    setIsEditing(true);
                                                    setSelectedSubCategory(subcategory);
                                                }}
                                            >
                                                <FaEdit size={20} />
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-800"
                                                onClick={() => {
                                                    setSubCategoryToDelete(subcategory._id);
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


                    {/* Pagination Controls */}
                    {subCategories.length > itemsPerPage && (
                        <div className="sticky bottom-0 bg-white border-t mt-6 py-3 flex justify-between items-center ">
                            <p className="text-sm text-gray-600 pl-4">
                                Showing {indexOfFirstItem + 1} to{" "}
                                {Math.min(indexOfLastItem, subCategories.length)} of {subCategories.length} subcategories
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
                                onClick={handleDeleteCategory}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit SubCategory Modal */}
            <AddEditSubCategory
                showModal={showModal}
                setShowModal={setShowModal}
                isEditing={isEditing}
                selectedSubCategory={selectedSubCategory}
                categories={categories}
                refreshSubCategories={fetchData}
            />
        </div>
    );
};

export default SubCategory;
