import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json", // Default for JSON data
  },
});

// Function to add a product
export const addProduct = async (productData, token) => {
  try {
    const response = await axiosInstance.post("/product", productData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response);
      console.error("Error Message:", error.response?.data?.message);
      toast.error(error.response?.data?.message);
      console.error("Error Details:", error.response?.data);
    } else if (error.request) {
      console.error("Error Request:", error.request);
    } else {
      console.error("General Error:", error.message);
    }
    throw new Error(error.response?.data?.message || "Failed to add product");
  }
};

// Function to get all products
export const getProducts = async () => {
  try {
    const response = await axiosInstance.get("/products");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch products"
    );
  }
};

// Function to get a single product by ID
export const getProductById = async (id) => {
  try {
    const response = await axiosInstance.get(`/product/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch product");
  }
};

// Function to update a product by ID
export const updateProduct = async (productId, formData, token) => {
  try {
    console.log("Updating product with ID:", productId);
    console.log("FormData contents:", [...formData.entries()]);

    const response = await axios.put(
      `https://e-commerce-new-l93m.onrender.com/api/product/${productId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update request failed:", error);
    throw error;
  }
};

// Function to delete a product by ID
export const deleteProduct = async (id, token) => {
  try {
    const response = await axiosInstance.delete(`/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete product"
    );
  }
};

// Function to get all brands
export const getBrands = async () => {
  try {
    const response = await axiosInstance.get("/brands");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch brands");
  }
};

// Function to get all items
export const getItems = async () => {
  try {
    const response = await axiosInstance.get("/items");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch items");
  }
};

// Function to get all categories
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};

// Function to get all Subcategories
export const getSubCategories = async () => {
  try {
    const response = await axiosInstance.get("/subcategories");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
};
