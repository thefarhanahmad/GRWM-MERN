import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASE_URL}/categories`;

// Get all categories
const getCategories = async () => {
  return await axios.get(API_URL);
};

// Get a single category by ID
const getCategoryById = async (categoryId) => {
  return await axios.get(`${API_URL}/${categoryId}`);
};

// Add a new category
const addCategory = async (categoryData, token) => {
  return await axios.post(API_URL, categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Update an existing category
const updateCategory = async (categoryId, categoryData, token) => {
  return await axios.put(`${API_URL}/${categoryId}`, categoryData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Delete a category
const deleteCategory = async (categoryId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error("Error deleting category:", error.response?.data || error.message);
      throw error;
    }
  };
  

export default { getCategories, getCategoryById, addCategory, updateCategory, deleteCategory };
