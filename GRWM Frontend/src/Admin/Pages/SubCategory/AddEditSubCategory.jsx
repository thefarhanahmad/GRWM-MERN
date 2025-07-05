import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { showToast } from "../../../components/Toast/Toast";
import subCategoryServices from "../../services/subCategory/subCategoryServices";
import categoryServices from "../../services/category/categoryServices";
import '../../../components/style/style.css';

const AddEditSubCategory = ({
    showModal,
    setShowModal,
    isEditing,
    selectedSubCategory,
    refreshSubCategories
}) => {
    const [subCategoryData, setSubCategoryData] = useState({ subcategoryName: "", categoryId: "" });
    const [categories, setCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef(null); // <-- ADD ref for dropdown

    const token = useSelector((state) => state.user.token) || localStorage.getItem("token");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryServices.getCategories(token);
                const categoryList = response.data?.data || [];
                setCategories(categoryList);
            } catch (error) {
                showToast("error", "Error fetching categories.");
                setCategories([]);
            }
        };

        if (showModal) {
            fetchCategories();
        }
    }, [showModal, token]);

    useEffect(() => {
        if (isEditing && selectedSubCategory) {
            setSubCategoryData({
                subcategoryName: selectedSubCategory.subcategoryName || "",
                categoryId: selectedSubCategory.category?._id || "",
            });
        } else {
            setSubCategoryData({ subcategoryName: "", categoryId: "" });
        }
    }, [isEditing, selectedSubCategory]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subCategoryData.subcategoryName || !subCategoryData.categoryId) {
            showToast("error", "Subcategory name and category are required!");
            return;
        }

        try {
            if (isEditing) {
                await subCategoryServices.updateSubCategory(selectedSubCategory._id, subCategoryData, token);
                showToast("success", "Subcategory updated successfully!");
            } else {
                await subCategoryServices.addSubCategory(subCategoryData, token);
                showToast("success", "Subcategory added successfully!");
            }

            setShowModal(false);
            refreshSubCategories();
        } catch (error) {
            showToast("error", error.response?.data?.message || "Error saving subcategory.");
        }
    };

    return showModal ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{isEditing ? "Edit" : "Add"} SubCategory</h3>
                    <button onClick={() => setShowModal(false)}>
                        <FaTimes className="text-xl text-gray-600 hover:text-black" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="SubCategory Name"
                        value={subCategoryData.subcategoryName}
                        onChange={(e) => setSubCategoryData({ ...subCategoryData, subcategoryName: e.target.value })}
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    
                    {/* Custom Category Dropdown */}
                    <div className="relative mb-4" ref={dropdownRef}>
                        <input
                            type="text"
                            placeholder="Select Category"
                            value={
                                categories.find((category) => category._id === subCategoryData.categoryId)
                                    ? categories.find((category) => category._id === subCategoryData.categoryId)
                                          .categoryName
                                    : ""
                            }
                            onFocus={() => setDropdownOpen(true)}
                            className="w-full p-2 border rounded-md"
                            readOnly
                        />
                        {dropdownOpen && (
                            <ul className="absolute w-full max-h-60 hide-scrollbar overflow-y-auto border bg-white rounded-md mt-1 shadow-lg z-10">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <li
                                            key={category._id}
                                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                            onClick={() => {
                                                setSubCategoryData({ ...subCategoryData, categoryId: category._id });
                                                setDropdownOpen(false);
                                            }}
                                        >
                                            {category.categoryName}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-600">No categories available</li>
                                )}
                            </ul>
                        )}
                    </div>

                    <button type="submit" className="w-full bg-black text-white p-2 rounded-md">
                        {isEditing ? "Update" : "Add"} SubCategory
                    </button>
                </form>
            </div>
        </div>
    ) : null;
};

export default AddEditSubCategory;
