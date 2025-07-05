import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/brands`;

const brandServices = {
  getBrands: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },

  addBrand: async (brandData, token) => {
    try {
      const response = await axios.post(BASE_URL, brandData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding brand:", error);
      throw error;
    }
  },

  updateBrand: async (id, updatedData, token) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  },

  deleteBrand: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  },
};

export default brandServices;
