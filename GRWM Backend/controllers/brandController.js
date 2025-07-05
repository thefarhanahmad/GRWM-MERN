const Brand = require("../models/Brand");

// =======================
// Create a new brand (with optional logo upload)
// =======================
exports.createBrand = async (req, res) => {
  try {
    const { brandName } = req.body;

    // Validate brandName
    if (
      !brandName ||
      typeof brandName !== "string" ||
      brandName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required and must be a non-empty string.",
      });
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ brandName: brandName.trim() });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "Brand already exists.",
      });
    }

    // Get brand logo (from multer/cloudinary if uploaded)
    const brandLogo = req.file ? req.file.path : null;

    // Create and save the new brand
    const newBrand = new Brand({
      brandName: brandName.trim(),
      brandLogo,
    });

    await newBrand.save();

    res.status(201).json({
      success: true,
      message: "Brand created successfully.",
      data: newBrand,
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =======================
// Get all brands
// =======================
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();

    if (!brands.length) {
      return res.status(404).json({
        success: false,
        message: "No brands found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brands fetched successfully.",
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =======================
// Get brand by ID
// =======================
exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Error fetching brand:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =======================
// Update brand by ID (with optional logo upload)
// =======================
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brandName } = req.body;
    const brandLogo = req.file ? req.file.path : null;

    const updatedData = {};
    if (brandName) updatedData.brandName = brandName.trim();
    if (brandLogo) updatedData.brandLogo = brandLogo;

    const updatedBrand = await Brand.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand updated successfully.",
      data: updatedBrand,
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// =======================
// Delete brand by ID
// =======================
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
