import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { showToast } from "../../../components/Toast/Toast";
import categoryServices from "../../services/category/categoryServices";
import axios from "axios";

const AddEditCategory = ({
    showModal,
    setShowModal,
    isEditing,
    selectedCategory,
    refreshCategories,
}) => {
    const [categoryData, setCategoryData] = useState({
        categoryName: "",
        itemId: "", // itemId will hold the selected item
    });
    const [items, setItems] = useState([]); // State to store fetched items
    const token = useSelector((state) => state.user.token) || localStorage.getItem("token");

    // Fetch items from the API
    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BASE_URL}/items`)
            .then((response) => {
                if (response.data.success) {
                    setItems(response.data.data); // Set items data
                }
            })
            .catch((error) => {
                console.error("Error fetching items:", error);
            });

        if (isEditing && selectedCategory) {
            // Prepopulate form with category details, including itemId
            setCategoryData({
                categoryName: selectedCategory.categoryName || "",
                itemId: selectedCategory.items?.[0]?._id || "", // Ensure you're fetching the itemId correctly
            });
        } else {
            setCategoryData({ categoryName: "", itemId: "" }); // Reset itemId when adding
        }
    }, [isEditing, selectedCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryData.categoryName || !categoryData.itemId) {
            showToast("error", "Category name and item ID are required!");
            return;
        }

        try {
            if (isEditing) {
                await categoryServices.updateCategory(selectedCategory._id, categoryData, token);
                showToast("success", "Category updated successfully!");
            } else {
                await categoryServices.addCategory(categoryData, token); // Send itemId here
                showToast("success", "Category added successfully!");
            }

            setShowModal(false);
            refreshCategories();
        } catch (error) {
            console.error("Error saving category:", error.response?.data?.message || error.message);
            showToast("error", error.response?.data?.message || "Error saving category.");
        }
    };

    return showModal ? (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-96">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{isEditing ? "Edit" : "Add"} Category</h3>
                    <button onClick={() => setShowModal(false)}>
                        <FaTimes className="text-xl text-gray-600 hover:text-black" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Category Name"
                        value={categoryData.categoryName}
                        onChange={(e) =>
                            setCategoryData({ ...categoryData, categoryName: e.target.value })
                        }
                        className="w-full p-2 border rounded-md mb-4"
                    />
                    <select
                        value={categoryData.itemId}
                        onChange={(e) =>
                            setCategoryData({ ...categoryData, itemId: e.target.value })
                        }
                        className="w-full p-2 border rounded-md mb-4"
                    >
                        <option value="">Select Item</option>
                        {items.map((item) => (
                            <option key={item._id} value={item._id}>
                                {item.itemName}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="w-full bg-black text-white p-2 rounded-md">
                        {isEditing ? "Update" : "Add"} Category
                    </button>
                </form>
            </div>
        </div>
    ) : null;
};

export default AddEditCategory;
