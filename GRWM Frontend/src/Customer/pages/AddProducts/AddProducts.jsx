import React, { useState, useEffect } from "react";
import ConditionSelect from "../../components/AddProducts/ConditionSelect";
import OccasionSelect from "../../components/AddProducts/OccasionSelect";
import ImageUpload from "../../components/AddProducts/ImageUpload";
import CleanReminderPopup from "../../components/CleanReminderPopup";
import ColorSelect from "../../components/AddProducts/ColorSelect";

import {
  addProduct,
  getBrands,
  getItems,
  getCategories,
} from "../../../services/Products/productServices";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastComponent, showToast } from "./ToastComponent";
import PhotosTips from "./PhotosTips";

const AddProducts = () => {
  const [productDetails, setProductDetails] = useState({
    title: "",
    description: "",
    size: "",
    brand: "",
    category: "",
    subcategory: "",
    itemType: "",
    color: "",
    occasion: "",
    price: "",
    finalPrice: "",
    originalPrice: "",
    image: null,
  });

  const [productImages, setProductImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(Array(10).fill(null));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]); // To store fetched brands
  const [items, setItems] = useState([]);
  const [selectedItemType, setSelectedItemType] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [protectionFeePercent, setProtectionFeePercent] = useState("");
  const [showReminder, setShowReminder] = useState(false);

  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  useEffect(() => {
    // Show popup when the page loads
    setShowReminder(true);
  }, []);


  // Fetching brands when the component mounts
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands();
        console.log("get brands response : ", data);
        if (data.success) {
          setBrands(data.data); // Set fetched brands to the state
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();

    const fetchItems = async () => {
      try {
        const data = await getItems();
        console.log("get items response : ", data);
        if (data.success) {
          setItems(data.data); // Set fetched items to the state
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        console.log("get categories response : ", response);
        setCategories(response.data); // Assuming `response.data` contains the category list
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    // Find selected category and set subcategories
    const selectedCat = categories.find((cat) => cat._id === categoryId);
    setSubcategories(selectedCat?.subcategories || []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let updatedDetails = {
      ...productDetails,
      [name]: value,
    };

    if (name === "price") {
      const calculatedFinalPrice = calculateFinalPrice(value);
      updatedDetails.finalPrice = calculatedFinalPrice;
    }

    setProductDetails(updatedDetails);
  };

  const validateForm = () => {
    const errors = {};
    if (!productDetails.title) errors.title = "Title is required.";
    if (!productDetails.description) {
      errors.description = "Description is required.";
    } else {
      const wordCount = productDetails.description.trim().split(/\s+/).length;
      if (wordCount > 100) {
        errors.description = "Description must not exceed 100 words.";
      }
    }
    if (!productDetails.category) errors.category = "Category is required.";

    // Image validation fix
    if (productImages.length === 0) {
      errors.image = "Image is required.";
      showToast("error", "Upload at least one image before submitting.");
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    if (!token) {
      showToast("error", "Please log in.");
      return;
    }
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Append all text fields
    for (let key in productDetails) {
      if (key !== "image") {
        // Skip image field
        formData.append(key, productDetails[key]);
      }
    }

    // Append all images correctly
    if (productImages.length > 0) {
      productImages.forEach((image) => {
        formData.append("images", image);
      });
    } else {
      showToast("error", "Upload at least one image before submitting.");

      setLoading(false);
      return;
    }

    try {
      for (let pair of formData.entries()) {
        console.log("form data to submit:", pair[0] + ": " + pair[1]);
      }

      const data = await addProduct(formData, token);
      console.log("Product added:", data);

      if (data.success && data.data) {
        showToast("success", "Product created successfully.", data.data);
      } else {
        showToast("error", "Failed to add product. Please try again.");
      }
      // Reset form
      setProductDetails({
        title: "",
        description: "",
        size: "",
        brand: "",
        category: "",
        subcategory: "",
        itemType: "",
        color: "",
        occasion: "",
        price: "",
        condition: "",
        image: null,
      });
      setPreviewImages([]);
      setProductImages([]);
      setErrors({});

      setTimeout(() => {
        navigate("/seller/hub");
      }, 5000);
    } catch (error) {
      console.error("Error adding product:", error);
      showToast("error", "Failed to add product. Please try again."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = (price) => {
    if (!price) {
      setProtectionFeePercent("");
      return "";
    }

    const numericPrice = parseFloat(price);
    let protectionFee = 0;

    if (numericPrice >= 100 && numericPrice <= 199) protectionFee = 20;
    else if (numericPrice >= 200 && numericPrice <= 499) protectionFee = 20;
    else if (numericPrice >= 500 && numericPrice <= 999) protectionFee = 20;
    else if (numericPrice >= 1000 && numericPrice <= 1999) protectionFee = 15;
    else if (numericPrice >= 2000 && numericPrice <= 2999) protectionFee = 15;
    else if (numericPrice >= 3000 && numericPrice <= 3999) protectionFee = 15;
    else if (numericPrice >= 4000 && numericPrice <= 4999) protectionFee = 12;
    else if (numericPrice >= 5000) protectionFee = 10;

    setProtectionFeePercent(protectionFee);

    const final = numericPrice + (numericPrice * protectionFee) / 100;
    return final.toFixed(2);
  };

  const getSizeOptions = () => {
    const selectedCat = categories.find(
      (cat) => cat._id === productDetails.category
    );
    const selectedSubcat = subcategories.find(
      (sub) => sub._id === productDetails.subcategory
    );

    if (!selectedCat) return []; // If category not selected yet

    const categoryName = selectedCat?.categoryName?.toLowerCase() || "";
    const subcategoryName =
      selectedSubcat?.subcategoryName?.toLowerCase() || "";

    // All possible keywords grouped smartly
    const clothingKeywords = [
      "bottoms",
      "clothing",
      "activewear",
      "outerwear",
      "dresses",
      "sleepwear",
      "loungewear",
      "swimwear",
      "sportswear",
      "casualwear",
      "athleisure",
      "streetwear",
      "formalwear",
      "winterwear",
      "suits",
      "jackets",
      "hoodies",
      "blazers",
      "shirts",
      "t-shirts",
      "tops",
      "pants",
      "trousers",
      "jeans",
      "shorts",
      "skirts",
      "coats",
      "overcoats",
      "sweaters",
      "vests",
      "jumpsuits",
      "rompers",
      "bodysuits",
      "leggings",
      "kurtas",
      "sarees",
      "ethnicwear",
      "blouses",
      "shrugs",
      "coverups",
      "tunics",
    ];

    const footwearKeywords = [
      "footwear",
      "shoes",
      "sneakers",
      "boots",
      "heels",
      "sandals",
      "slippers",
      "loafers",
      "moccasins",
      "derbys",
      "brogues",
      "flip-flops",
      "wedges",
      "flats",
      "pumps",
      "oxfords",
      "trainers",
      "sports shoes",
      "running shoes",
      "formal shoes",
    ];

    const accessoriesKeywords = [
      "accessories",
      "belts",
      "hats",
      "scarves",
      "gloves",
      "ties",
      "suspenders",
      "cufflinks",
      "wallets",
      "caps",
      "mufflers",
      "keychains",
      "watch",
      "sunglasses",
      "glasses",
      "eyewear",
      "brooches",
    ];

    const jewelryKeywords = [
      "jewelry",
      "rings",
      "earrings",
      "necklaces",
      "bracelets",
      "bangles",
      "anklets",
      "pendants",
      "chains",
      "charms",
    ];

    const bagsKeywords = [
      "bags",
      "handbags",
      "backpacks",
      "clutches",
      "totes",
      "laptop bags",
      "duffle bags",
      "messenger bags",
      "wallets",
      "sling bags",
    ];

    const bookKeywords = [
      "books",
      "book",
      "magazine",
      "comic",
      "comics",
      "novel",
      "literature",
      "biography",
      "autobiography",
      "guidebook",
      "encyclopedia",
      "journal",
    ];

    // Matching logic:
    const matches = (keywords) =>
      keywords.some(
        (keyword) =>
          categoryName.includes(keyword) || subcategoryName.includes(keyword)
      );

    if (matches(clothingKeywords)) {
      return ["XS", "S", "M", "L", "XL", "XXL"];
    }

    if (matches(footwearKeywords)) {
      if (subcategoryName.includes("men")) {
        return [
          "EU 39",
          "EU 40",
          "EU 41",
          "EU 42",
          "EU 43",
          "EU 44",
          "EU 45",
          "EU 46",
          "EU 47",
          "EU 48",
          "Other",
        ];
      } else if (subcategoryName.includes("women")) {
        return [
          "EU 35",
          "EU 36",
          "EU 37",
          "EU 38",
          "EU 39",
          "EU 40",
          "EU 41",
          "EU 42",
          "EU 43",
          "EU 44",
          "EU 45",
          "EU 46",
          "EU 47",
          "EU 48",
          "Other",
        ];
      }
      return [
        "EU 35",
        "EU 36",
        "EU 37",
        "EU 38",
        "EU 39",
        "EU 40",
        "EU 41",
        "EU 42",
        "EU 43",
        "EU 44",
        "EU 45",
        "EU 46",
        "EU 47",
        "EU 48",
        "Other",
      ];
    }

    if (matches(accessoriesKeywords)) {
      return ["One Size"];
    }

    if (matches(jewelryKeywords)) {
      return ["One Size"];
    }

    if (matches(bagsKeywords)) {
      return ["One Size"];
    }

    // Default fallback
    return [""];
  };

  useEffect(() => {
    // Whenever itemType changes, reset size to empty
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      size: "", // Reset size when itemType changes
    }));
  }, [productDetails.itemType]);

  // Handle collection change
  const handleItemTypeChange = (e) => {
    const itemTypeId = e.target.value;
    setSelectedItemType(itemTypeId);

    // Find the selected collection (item) and set corresponding categories
    const selectedItem = items.find((item) => item._id === itemTypeId);
    setCategories(selectedItem?.categories || []); // Set categories for the selected collection
  };

  console.log("product details : ", productDetails);

  return (
    <div className="container mx-auto py-6 px-3 sm:px-6 lg:p-16 bg-white shadow-lg rounded-xl">
      {/* The popup shows automatically on page load */}
      <CleanReminderPopup show={showReminder} onClose={() => setShowReminder(false)} />
      <ToastComponent />

      <h2 className="text-lg lg:text-3xl font-bold font-horizon text-black  pb-2">
        Upload New Product
      </h2>
      <PhotosTips />

      <form onSubmit={handleSubmit} className="space-y-4 font-openSans">
        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            previewImages={previewImages}
            productImages={productImages}
            setPreviewImages={setPreviewImages}
            setProductImages={setProductImages}
            errors={errors}
            showToast={showToast}
          />

          {/* Product Details Section */}
          <div className="space-y-4">
            {/* Tittle */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter Product Title"
                value={productDetails.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors.title ? "border-red-500" : "border-black"
                  } rounded-lg text-sm focus:outline-none`}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/*   Description  */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                placeholder="Enter Product Description"
                value={productDetails.description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-4 py-3 border ${errors.description ? "border-red-500" : "border-black"
                  } rounded-lg text-sm focus:outline-none`}
                required
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Condition */}
            <ConditionSelect
              value={productDetails.condition}
              onChange={handleInputChange}
            />

            {/* Menu Item */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Collection *
              </label>
              <select
                name="itemType"
                value={productDetails.itemType}
                onChange={(e) => {
                  handleItemTypeChange(e);
                  handleInputChange(e);
                }}
                className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none 
        ${productDetails.itemType ? "text-black" : "text-gray-600 text-sm"}`}
                required
              >
                <option value="">Select Collection</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.itemName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={productDetails.category}
                onChange={(e) => {
                  handleCategoryChange(e);
                  handleInputChange(e);
                }}
                className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none ${productDetails.category
                    ? "text-black"
                    : "text-gray-600 text-sm"
                  }`}
                required
              >
                <option value="">Select Category</option>
                {productDetails.itemType &&
                  categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
              </select>

              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={productDetails.subcategory}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none 
        ${productDetails.subcategory ? "text-black" : "text-gray-600 text-sm"}`}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.subcategoryName}
                  </option>
                ))}
              </select>

              {/* Optional error display (if you still want to show warning, not error) */}
              {/* {errors.subcategory && (
        <p className="text-sm text-yellow-500">{errors.subcategory}</p>
    )} */}
            </div>
          </div>
        </div>

        {/* Second Row for Size, Color, Category, Subcategory, Item Type, Occasion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Occasion Dropdown */}
          <OccasionSelect
            value={productDetails.occasion}
            onChange={handleInputChange}
            itemType={productDetails.itemType}
          />

          {/* Brand */}
          <div>
            <label className="block text-md font-medium text-gray-900 mb-1">
              Brand *
            </label>
            <select
              name="brand"
              value={productDetails.brand}
              onChange={handleInputChange}
              disabled={productDetails.itemType === "680af67079e7f7670b39168d"}
              className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none 
            ${productDetails.brand ? "text-black" : "text-gray-600 text-sm"}`}
              required
            >
              <option value="">Select Brand</option>
              {brands.map((brand, index) => (
                <option key={brand._id || index} value={brand._id}>
                  {brand.brandName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Price */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Original Price (INR) *
              </label>
              <input
                type="number"
                name="originalPrice"
                placeholder="Enter Original Price"
                value={productDetails.originalPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none placeholder:text-sm"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Selling Price (INR) *
              </label>
              <input
                type="number"
                name="price"
                value={productDetails.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none placeholder:text-sm"
                min="0"
                step="0.01" // Allows decimals for prices like 19.99
                placeholder="Enter Product Price"
              />
            </div>

            {/* Final Price (Read-only) */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Final Price (INR) *
              </label>
              <input
                type="text"
                name="finalPrice"
                value={productDetails.finalPrice}
                readOnly
                className="w-full px-4 py-3 border border-gray-400 bg-gray-100 text-gray-700 rounded-lg placeholder:text-sm"
                placeholder="Final Price"
              />
              {protectionFeePercent > 0 && (
                <span className="text-xs text-red-600 mt-1 block">
                  Protection Fee Applied: {protectionFeePercent}%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Size */}
            <div>
              <label className="block text-md font-medium text-gray-900 mb-1">
                Size *
              </label>
              <select
                name="size"
                value={productDetails.size}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none placeholder:text-sm"
                disabled={
                  productDetails.itemType === "680af67079e7f7670b39168d"
                }
              >
                <option value="">Select Size</option>
                {getSizeOptions().map((sizeOption, index) => (
                  <option key={index} value={sizeOption}>
                    {sizeOption}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <ColorSelect
              value={productDetails.color}
              onChange={handleInputChange}
              disabled={productDetails.itemType === "680af67079e7f7670b39168d"}
            />

          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center md:justify-end  md:pt-6">
          <button
            type="submit"
            className="px-14 py-3 bg-black text-lg text-white rounded-sm shadow-lg  focus:outline-none"
            disabled={loading}
          >
            {loading ? "Adding..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProducts;
