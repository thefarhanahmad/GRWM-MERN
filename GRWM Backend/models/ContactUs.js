const mongoose = require("mongoose");

const ContactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },

  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
  },

  subject: {
    type: String,
    required: true,
    trim: true,
  },

  message: {
    type: String,
    required: true,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactUs = mongoose.model("ContactUs", ContactUsSchema);
module.exports = ContactUs;
