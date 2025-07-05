const ContactUs = require("../models/ContactUs"); // Adjust path if necessary

// Create a new ContactUs message
const createContactMessage = async (req, res) => {
  try {
    const { name, email, phoneNumber, subject, message } = req.body;

    // Basic Validation
    if (!name || !email || !subject || !message || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject,PhoneNumber and message are required.",
      });
    }

    const newMessage = new ContactUs({
      name,
      email,
      phoneNumber,
      subject,
      message,
    });

    const savedMessage = await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Contact message submitted successfully.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Error creating contact message:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting message.",
    });
  }
};

// Get all ContactUs messages
const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Contact messages retrieved successfully.",
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching messages.",
    });
  }
};

module.exports = {
  createContactMessage,
  getAllContactMessages,
};
