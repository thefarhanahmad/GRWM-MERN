import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const TestimonialModal = ({ onClose, token }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !desc.trim())
      return toast.error("All fields required");

    try {
      const res = await axios.post(
        `${BASE_URL}/testimonial`,
        { title, description: desc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message || "Submitted!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Testimonial</h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full border px-3 py-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          rows="4"
          placeholder="Description"
          className="w-full border px-3 py-2 rounded mb-4"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialModal;
