import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/Products/productServices";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { CiCirclePlus } from "react-icons/ci";
import { Minus } from "lucide-react";

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const token = user?.token || localStorage.getItem("token");

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
        originalPrice: "",
        condition: "New with tags", // Default value set hai
        images: [],
    });

    const [previewImages, setPreviewImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]); // To store File objects
    const [loading, setLoading] = useState(false);
    const [imageError, setImageError] = useState("");


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductById(productId);
                console.log("Fetched Product Data:", data);

                if (data?.success && data.data) {
                    const fetchedImages = Array.isArray(data.data.images) ? data.data.images : [];

                    console.log("Setting images:", fetchedImages);

                    setPreviewImages(fetchedImages);
                    setProductDetails({
                        ...data.data,
                        category: data.data.category?._id || "",
                        subcategory: data.data.subcategory?._id || "",
                        images: fetchedImages,
                    });

                    setImageError(fetchedImages.length === 0 ? "Please upload an image before updating." : "");
                } else {
                    toast.error("Failed to load product data.");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                toast.error("Error fetching product details.");
            }
        };

        if (productId) fetchProduct();
    }, [productId]);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + previewImages.length > 5) {
            setImageError("You can upload a maximum of 5 images.");
            toast.error("You can upload a maximum of 5 images.");
            return;
        }

        const newPreviews = files.map((file) => URL.createObjectURL(file));

        setPreviewImages((prev) => [...prev, ...newPreviews]);
        setSelectedFiles((prev) => [...prev, ...files]);
        setProductDetails((prev) => ({
            ...prev,
            images: [...prev.images, ...newPreviews],
        }));
    };

    const removeImage = (index) => {
        const updatedPreviews = [...previewImages];
        updatedPreviews.splice(index, 1);

        const updatedFiles = [...selectedFiles];
        updatedFiles.splice(index, 1);

        const updatedImages = [...productDetails.images];
        updatedImages.splice(index, 1);

        setPreviewImages(updatedPreviews);
        setSelectedFiles(updatedFiles);
        setProductDetails((prev) => ({
            ...prev,
            images: updatedImages,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please log in.");
            return;
        }

        console.log("Submitting product with images:", productDetails.images);

        if (previewImages.length === 0 && productDetails.images.length === 0) {
            setImageError("Please upload at least one image.");
            toast.error("Please upload at least one image.");
            return;
        }

        setLoading(true);
        const formData = new FormData();

        // Append fields except images
        for (let key in productDetails) {
            if (key !== "images") {
                formData.append(key, productDetails[key]);
            }
        }

        // **Purani images ko bhi formData mein add karein agar available hai**
        if (productDetails.images.length > 0) {
            productDetails.images.forEach((url) => {
                console.log("Adding existing image:", url);
                formData.append("existingImages[]", url);
            });
        }

        // **Nayi images bhi formData mein add karein**
        selectedFiles.forEach((file) => {
            console.log("Adding new image:", file);
            formData.append("images", file);
        });

        try {
            const data = await updateProduct(productId, formData, token);
            console.log("Update Response:", data);
            if (data.success) {
                toast.success("Product updated successfully!");
                setTimeout(() => navigate("/profile"), 2000);
            } else {
                toast.error("Failed to update product.");
            }
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    const handleDrop = (e) => {
        e.preventDefault(); // Prevent default browser behavior
        const files = Array.from(e.dataTransfer.files);

        if (files.length > 0) {
            const imageFiles = files.filter(file => file.type.startsWith("image/"));
            const newPreviews = imageFiles.map(file => URL.createObjectURL(file));

            setPreviewImages(prev => [...prev, ...newPreviews]);
            setSelectedFiles(prev => [...prev, ...imageFiles]);
            setProductDetails(prev => ({
                ...prev,
                images: [...prev.images, ...newPreviews],
            }));
        }
    };




    return (
        <div className="container mx-auto p-6 lg:p-20 bg-white shadow-lg rounded-xl">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Edit Product</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Advanced Image Upload UI */}
                    <div className="mt-2 lg:h-[500px] p-4 border border-gray-400 rounded-md">
                        <h3 className="text-md text-gray-900 mb-6 text-left">Add up to 5 images to showcase your product.</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="relative w-36 h-36 lg:w-[200px] lg:h-[200px] border-2 border-dashed rounded-sm border-gray-300 shadow-sm overflow-hidden flex items-center justify-center bg-white"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                >
                                    {previewImages[index] ? (
                                        <>
                                            <img
                                                src={previewImages[index]}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-1 bg-red-500 text-white p-1 rounded-full"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <label
                                            htmlFor={`fileInput-${index}`}
                                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 text-gray-800 font-medium"
                                        >
                                            <CiCirclePlus className="w-8 h-8 mb-1" />
                                            Add more pics
                                        </label>
                                    )}
                                    <input
                                        type="file"
                                        id={`fileInput-${index}`}
                                        onChange={(e) => handleImageChange(e, index)}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label>Product Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={productDetails.title}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={productDetails.description}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded resize-none min-h-[150px]"
                            required
                        />
                        {/* Price and Original Price in one row */}
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label>Selling Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={productDetails.price}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="w-1/2">
                                <label>Original Price *</label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={productDetails.originalPrice}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        {/* Size and Color in one row */}
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label>Size *</label>
                                <select
                                    id="size"
                                    name="size"
                                    value={productDetails.size}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none 
                ${productDetails.size ? "text-black" : "text-gray-600 text-sm"}`}
                                    required
                                >
                                    <option value="">Select Size</option>
                                    <optgroup label="-- Clothing --">
                                        <option value="XS">XS</option>
                                        <option value="S">S</option>
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XXL">XXL</option>
                                    </optgroup>

                                    <optgroup label="-- Footwear --">
                                        <option value="6 UK">6 UK</option>
                                        <option value="7 UK">7 UK</option>
                                        <option value="8 UK">8 UK</option>
                                        <option value="9 UK">9 UK</option>
                                        <option value="10 UK">10 UK</option>
                                        <option value="11 UK">11 UK</option>
                                    </optgroup>

                                    <optgroup label="-- Other --">
                                        <option value="Free Size">Free Size</option>
                                        <option value="Not Applicable">Not Applicable</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label>Colour *</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={productDetails.color}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condition *
                                </label>
                                <select
                                    name="condition"
                                    value={productDetails.condition || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-black rounded-lg focus:outline-none"
                                    required
                                >
                                    <option value="" disabled>Select Condition</option>
                                    {["New with tags", "New without tags", "Very good", "Good", "Satisfactory"].map((condition) => (
                                        <option key={condition} value={condition}>
                                            {condition}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-1/2">
                                <label>Occasion *</label>
                                <select
                                    name="occasion"
                                    value={productDetails.occasion}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="Casual">Casual</option>
                                    <option value="Formal">Formal</option>
                                    <option value="Party">Party</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Vacation">Vacation</option>
                                    <option value="Work">Work</option>
                                    <option value="Festival">Festival</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <button
                        type="button"
                        className="border border-black text-black px-8 py-3 rounded-sm"
                        onClick={() => navigate("/profile")}
                    >
                        Cancel Edit
                    </button>
                    <button
                        type="submit"
                        className="bg-black text-white px-10 py-3 rounded-sm"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Product"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;