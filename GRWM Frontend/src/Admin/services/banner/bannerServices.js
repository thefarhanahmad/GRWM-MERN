import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/banners`;

// Function to get authentication token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

const bannerServices = {
  getBanners: async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching banners:", error.response?.data || error);
      throw error;
    }
  },

  updateBannerStatus: async (id, status) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await axios.put(
        `${BASE_URL}/${id}`,
        { status }, // Only sending status update
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating banner status:", error.response?.data || error);
      throw error;
    }
  },

  deleteBanner: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting banner:", error.response?.data || error);
      throw error;
    }
  },
};

export default bannerServices;
