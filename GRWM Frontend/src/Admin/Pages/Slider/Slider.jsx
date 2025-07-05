import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { ImSpinner2 } from "react-icons/im";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import sliderServices from "../../services/slider/sliderServices";

const Slider = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sliderData, setSliderData] = useState({ caption: "", image: null });

  const token = useSelector((state) => state.user?.token) || localStorage.getItem("token");

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await sliderServices.getSliders();
        setSliders(response?.data || []);
      } catch (error) {
        showToast("error", "Error fetching sliders.");
      } finally {
        setLoading(false);
      }
    };
    fetchSliders();
  }, []);

  const handleFileChange = (e) => {
    setSliderData({ ...sliderData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sliderData.caption || (!sliderData.image && !isEditing)) {
      showToast("error", "All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("caption", sliderData.caption);
    if (sliderData.image) formData.append("image", sliderData.image);

    try {
      if (isEditing) {
        await sliderServices.updateSlider(selectedSlider, formData, token);
        showToast("success", "Slider updated successfully!");
      } else {
        await sliderServices.addSlider(formData, token);
        showToast("success", "Slider added successfully!");
      }

      const response = await sliderServices.getSliders();
      setSliders(response?.data || []);
      setShowModal(false);
      setIsEditing(false);
      setSliderData({ caption: "", image: null });
    } catch (error) {
      showToast("error", "Error saving slider.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await sliderServices.deleteSlider(id, token);
      showToast("success", "Slider deleted successfully!");
      setSliders(sliders.filter((slider) => slider._id !== id));
    } catch (error) {
      showToast("error", "Error deleting slider.");
    }
  };

  return (
    <div className="lg:p-12">
      <ToastComponent />
      <div className="mb-10 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sliders</h2>
        <button
          className="bg-black text-white px-6 py-2 rounded-md flex items-center gap-2"
          onClick={() => {
            setShowModal(true);
            setIsEditing(false);
            setSliderData({ caption: "", image: null });
          }}
        >
          <FaPlus /> Add Slider
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <ImSpinner2 className="text-4xl animate-spin" />
        </div>
      ) : sliders.length > 0 ? (
        <table className="w-full bg-white border rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">S.No</th>
              <th className="p-4">Image</th>
              <th className="p-4">Caption</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sliders.map((slider, index) => (
              <tr key={slider._id} className="border-b">
                <td className="p-4 text-center">{index + 1}</td>
                <td className="p-4 text-center">
                  <img src={slider.image} alt={slider.caption} className="w-16 h-16 object-contain mx-auto" />
                </td>
                <td className="p-4 text-center font-semibold">{slider.caption}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-4">
                    <button
                      className="text-green-500 hover:text-green-800"
                      onClick={() => {
                        setSelectedSlider(slider._id);
                        setSliderData({ caption: slider.caption, image: slider.image });
                        setIsEditing(true);
                        setShowModal(true);
                      }}
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-800"
                      onClick={() => handleDelete(slider._id)}
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500">No sliders found</div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Slider" : "Add Slider"}</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full p-2 mb-4 border rounded"
                placeholder="Caption"
                value={sliderData.caption}
                onChange={(e) => setSliderData({ ...sliderData, caption: e.target.value })}
              />
              <input type="file" className="w-full p-2 mb-4 border rounded" onChange={handleFileChange} />
              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slider;
