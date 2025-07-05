import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useSelector } from "react-redux";

const Contact = () => {
  const user = useSelector((state) => state.user.user);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });

  // Autofill if user exists
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phone || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/contact-form`,
        formData
      );

      setIsSubmitted(true);

      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      alert("There was an error submitting the form. Please try again.");
    }
  };

  return (
    <div className="bg-white text-black font-openSans min-h-screen py-10 md:py-20 px-3 md:px-10 lg:px-24">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-horizon mb-4 font-semibold text-black lg:text-3xl text-xl"
        >
          Contact Support
        </motion.h1>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 p-6 md:p-10 rounded-lg shadow-md grid grid-cols-1 gap-6"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Name <sup>*</sup>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email <sup>*</sup>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number <sup>*</sup>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Your Phone Number"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <sup>*</sup>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject of your message"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Message <sup>*</sup>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                rows="5"
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              ></textarea>
            </div>

            <div>
              <button
                type="submit"
                className="bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition"
              >
                Send Message
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 text-2xl font-semibold text-green-600"
          >
            Thanks for reaching out! We'll connect with you shortly.
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Contact;
