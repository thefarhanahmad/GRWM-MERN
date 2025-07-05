const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "E_Commerce_Products",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "pdf"],
  },
});

const upload = multer({ storage });

module.exports = upload;
