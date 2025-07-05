import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BASE_URL}/slider`;

const sliderServices = {
  getSliders: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching sliders:", error);
      throw error;
    }
  },

  addSlider: async (sliderData, token) => {
    try {
      const response = await axios.post(BASE_URL, sliderData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding slider:", error);
      throw error;
    }
  },

  updateSlider: async (id, updatedData, token) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating slider:", error);
      throw error;
    }
  },

  deleteSlider: async (id, token) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting slider:", error);
      throw error;
    }
  },
};

export default sliderServices;
