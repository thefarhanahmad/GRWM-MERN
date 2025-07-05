import React, { useState } from "react";
import Modal from "react-modal";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";

import NaturalLight_Wrong from "../../../assets/PhotoTips/Grwm_NaturalLight_Wrong.jpg";
import NaturalLight_Right from "../../../assets/PhotoTips/Grwm_NaturalLight_Right.jpg";
import Background_Wrong from "../../../assets/PhotoTips/grwm_bg_wrong.jpg";
import Background_Right from "../../../assets/PhotoTips/grwm_bg_right.jpg";
import Dont_Hide_Right from "../../../assets/PhotoTips/Grwm_Hide.jpg";
import Dont_Hide_Wrong from "../../../assets/PhotoTips/grwm-hide.jpg";
import HalfLook from "../../../assets/PhotoTips/Grwm_HalfLook.jpg";
import CompleteLook from "../../../assets/PhotoTips/Grwm_CompleteLook.jpg";
import Grwm_catfishcontent_Wrong from "../../../assets/PhotoTips/Grwm_catfishcontent_Wrong.jpg";
import Grwm_catfishcontent_Right from "../../../assets/PhotoTips/Grwm_catfishcontent_Right.jpg";

Modal.setAppElement("#root");

const guidelines = [
  {
    title: "Natural light hits different",
    wrongImg: NaturalLight_Wrong,
    correctImg: NaturalLight_Right,
  },
  {
    title: "⁠⁠Let the fit shine, not the background",
    wrongImg: Background_Wrong,
    correctImg: Background_Right,
  },
  {
    title: "⁠⁠Don’t hide the drip just ‘cause it’s got a little mess.",
    wrongImg: Dont_Hide_Wrong,
    correctImg: Dont_Hide_Right,
    showWrongCheck: false,
  },
  {
    title: "⁠⁠Whole look > half look.",
    wrongImg: HalfLook,
    correctImg: CompleteLook,
  },
  {
    title: "No catfish content, pls",
    wrongImg: Grwm_catfishcontent_Wrong,
    correctImg: Grwm_catfishcontent_Right,
  },
];

const PhotosTips = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % guidelines.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + guidelines.length) % guidelines.length
    );
  };

  const setSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentItem = guidelines[currentIndex];
  const isSameImage = currentItem.wrongImg === currentItem.correctImg;
  const showWrongCheck = currentItem.showWrongCheck ?? isSameImage;

  return (
    <div className="flex flex-col items-start">
      <p
        className="text-blue-600 underline cursor-pointer font-medium text-lg hover:text-blue-800 transition"
        onClick={() => setIsOpen(true)}
      >
        See Photo Tips
      </p>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="absolute left-1/2 top-1/2 w-[90%] max-w-[700px] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-black hover:text-red-600 text-xl"
        >
          <FaTimes />
        </button>

        <h2 className="text-lg md:text-2xl font-semibold mb-6 text-center text-black">
          {currentItem.title}
        </h2>

        <div className="flex md:flex-row justify-center gap-6 items-center">
          {/* Wrong Image */}
          <div className="relative w-[250px] h-[250px] lg:w-[300px] lg:h-[400px] flex items-center justify-center border rounded shadow">
            <img
              src={currentItem.wrongImg}
              alt="Wrong"
              className="w-full h-full rounded object-cover"
            />
            {showWrongCheck ? (
              <FaCheckCircle className="absolute top-2 right-2 text-green-600 text-3xl" />
            ) : (
              <FaTimesCircle className="absolute top-2 right-2 text-red-600 text-3xl" />
            )}
          </div>

          {/* Correct Image */}
          <div className="relative w-[250px] h-[250px] lg:w-[300px] lg:h-[400px] flex items-center justify-center border rounded shadow">
            <img
              src={currentItem.correctImg}
              alt="Correct"
              className="w-full h-full rounded"
            />
            <FaCheckCircle className="absolute top-2 right-2 text-green-600 text-2xl" />
          </div>
        </div>

        <div className="flex md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
          <button
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            onClick={prevSlide}
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {guidelines.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentIndex ? "bg-green-600" : "bg-gray-300"
                }`}
                onClick={() => setSlide(index)}
              />
            ))}
          </div>

          <button
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            onClick={nextSlide}
          >
            Next
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PhotosTips;
