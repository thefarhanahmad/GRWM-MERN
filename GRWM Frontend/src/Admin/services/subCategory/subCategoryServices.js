import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/subcategories`;

const subCategoryServices = {
  getSubCategories: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      throw error;
    }
  },

  addSubCategory: async (subCategoryData, token) => {
    try {
      const response = await axios.post(BASE_URL, subCategoryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding subcategory:", error);
      throw error;
    }
  },

  updateSubCategory: async (id, updatedData, token) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating subcategory:", error);
      throw error;
    }
  },

  deleteSubCategory: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      throw error;
    }
  },
};

export default subCategoryServices;
