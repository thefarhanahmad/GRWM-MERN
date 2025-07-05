import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BASE_URL}/items`; // The API endpoint for menu items

// Fetch all menu items
const getMenuItems = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error fetching menu items');
  }
};

// Add a new menu item
const addMenuItem = async (menuItemData, token) => {
  try {
    const response = await axios.post(API_URL, menuItemData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error adding menu item');
  }
};

// Update an existing menu item
const updateMenuItem = async (itemId, menuItemData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${itemId}`, menuItemData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error updating menu item');
  }
};

// Delete a menu item
const deleteMenuItem = async (itemId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting menu item');
  }
};

export default {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
