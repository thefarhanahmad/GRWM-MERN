const Testimonial = require("../models/Testimonial");

// ADD Testimonial
exports.addTestimonial = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    const newTestimonial = new Testimonial({
      title,
      description,
      user: userId,
      approved: false,
    });

    await newTestimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial submitted successfully.",
    });
  } catch (error) {
    console.error("Error in addTestimonial:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

// GET Testimonials (approved only)
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ priority: 1, createdAt: -1 })
      .populate("user", "name email profileImage");

    res.status(200).json({
      success: true,
      message: "Testimonials fetched successfully.",
      data: testimonials,
    });
  } catch (error) {
    console.error("Error in getTestimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials.",
      error: error.message,
    });
  }
};

// UPDATE Testimonial (admin or owner)
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    const updated = await Testimonial.findByIdAndUpdate(
      id,
      { title, description, priority },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updateTestimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update testimonial.",
      error: error.message,
    });
  }
};

// DELETE Testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await Testimonial.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteTestimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial.",
      error: error.message,
    });
  }
};
