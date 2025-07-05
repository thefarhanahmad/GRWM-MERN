import React, { useState, useEffect } from 'react';
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { ImSpinner2 } from "react-icons/im";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import menuServices from "../../services/menu/menuServices"; // Assuming menuServices are handled separately for API calls

const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [menuItemData, setMenuItemData] = useState({ itemName: "", priority: 1 }); // Default priority value is 1
    const token = useSelector((state) => state.user?.token) || localStorage.getItem("token") || "";

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await menuServices.getMenuItems(token);
            if (response.data?.success) {
                setMenuItems(response.data.data || []);
                // Automatically assign priority to the next item
                if (response.data.data && response.data.data.length > 0) {
                    const maxPriority = Math.max(...response.data.data.map(item => item.priority));
                    setMenuItemData({ ...menuItemData, priority: maxPriority + 1 });
                }
            } else {
                showToast("error", "Invalid response structure.");
                console.error("Invalid response structure.");
            }
        } catch (error) {
            showToast("error", "Error fetching menu items.");
            console.error("Error fetching menu items:", error); // Log error to console
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!menuItemData.itemName) {
            showToast("error", "Item name is required!");
            console.error("Item name is required!");
            return;
        }
        if (menuItemData.priority <= 0) {
            showToast("error", "Priority must be a positive number.");
            console.error("Priority must be a positive number.");
            return;
        }
        try {
            if (isEditing) {
                await menuServices.updateMenuItem(selectedItem, menuItemData, token);
                showToast("success", "Menu item updated successfully!");
                console.log("Menu item updated successfully!");
            } else {
                await menuServices.addMenuItem(menuItemData, token);
                showToast("success", "Menu item added successfully!");
                console.log("Menu item added successfully!");
            }
            fetchMenuItems();
            setShowModal(false);
            setIsEditing(false);
            setMenuItemData({ itemName: "", priority: menuItemData.priority + 1 }); // Reset with next priority
        } catch (error) {
            showToast("error", "Error saving menu item.");
            console.error("Error saving menu item:", error); // Log error to console
        }
    };

    const handleEditClick = (item) => {
        setSelectedItem(item._id);
        setMenuItemData({ itemName: item.itemName || "", priority: item.priority || 1 }); // Prepopulate priority value
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        try {
            const response = await menuServices.deleteMenuItem(selectedItem, token);
            showToast("success", "Menu item deleted successfully!");
            console.log("Menu item deleted successfully!");
            fetchMenuItems();
        } catch (error) {
            showToast("error", "Error deleting menu item.");
            console.error("Error deleting menu item:", error); // Log error to console
        } finally {
            setShowConfirmModal(false);
            setSelectedItem(null);
        }
    };

    return (
        <div className="lg:p-12">
            <ToastComponent />
            <div className="mb-10 flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Menu Items</h2>
                <button
                    className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2"
                    onClick={() => {
                        setShowModal(true);
                        setIsEditing(false);
                        setMenuItemData({ itemName: "", priority: menuItems.length + 1 });
                    }}
                >
                    <FaPlus /> Add Menu Item
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-60">
                    <ImSpinner2 className="text-4xl text-black animate-spin" />
                </div>
            ) : (
                <table className="w-full bg-white border rounded-md">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">S.No</th>
                            <th className="p-4">Item Name</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menuItems.map((item, index) => (
                            <tr key={item._id} className="border-b">
                                <td className="p-4 text-center">{index + 1}</td>
                                <td className="p-4 text-center font-semibold">{item.itemName}</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center items-center gap-4">
                                        <button className="text-green-500 hover:text-green-800" onClick={() => handleEditClick(item)}>
                                            <FaEdit size={20} />
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-800"
                                            onClick={() => {
                                                setSelectedItem(item._id);
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
            )}

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
                                onClick={handleDeleteItem}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg w-96 relative">
                        <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={() => setShowModal(false)}>
                            <FaTimes size={20} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                                    value={menuItemData.itemName || ""}
                                    onChange={(e) => setMenuItemData({ ...menuItemData, itemName: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Priority</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-gray-300 rounded-lg outline-none"
                                    value={menuItemData.priority || 1}
                                    readOnly // Disable input for priority as it's handled automatically
                                />
                            </div>
                            <button type="submit" className="bg-black text-white px-6 py-2 rounded-md w-full">
                                {isEditing ? "Update Item" : "Add Item"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
