const Slider = require("../models/Slider");

exports.createSlider = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image file is required" });
    }

    const slider = await Slider.create({
      image: req.file.path, // Save file path or filename
      caption: req.body.caption || "",
      link: req.body.link || "",
    });

    res.status(201).json({ success: true, data: slider });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err.message });
  }
};

exports.getSliders = async (req, res) => {
  try {
    const sliders = await Slider.find();
    res
      .status(200)
      .json({ success: true, count: sliders.length, data: sliders });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.getSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });
    }
    res.status(200).json({ success: true, data: slider });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

exports.updateSlider = async (req, res) => {
  try {
    let slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });
    }

    if (req.file) {
      req.body.image = req.file.path; // Update image path if a new image is uploaded
    }

    slider = await Slider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: slider });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Invalid data", error: err.message });
  }
};

exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res
        .status(404)
        .json({ success: false, message: "Slider not found" });
    }

    await slider.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Slider deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
