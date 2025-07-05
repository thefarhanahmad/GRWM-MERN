import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { GrAchievement } from "react-icons/gr";
import { FaMedal, FaStar, FaTrophy, FaCrown, FaGem } from "react-icons/fa";
import { FiX, FiTrendingUp, FiAward } from "react-icons/fi";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAchievements,
  markPopupsSeen,
} from "../../../redux/slices/achievementSlice";
import { toast } from "react-hot-toast";

const badgeDetails = {
  Bronze: {
    className: "bg-pink-100 text-black border-pink-300",
    icon: <FaMedal className="text-pink-500 text-4xl" />,
    color: "#ec4899",
  },
  Silver: {
    className: "bg-purple-100 text-black border-purple-300",
    icon: <FaStar className="text-purple-500 text-4xl" />,
    color: "#a855f7",
  },
  Gold: {
    className: "bg-yellow-100 text-black border-yellow-300",
    icon: <FaTrophy className="text-yellow-500 text-4xl" />,
    color: "#facc15",
  },
  Platinum: {
    className: "bg-blue-100 text-black border-blue-300",
    icon: <FaCrown className="text-blue-500 text-4xl" />,
    color: "#3b82f6",
  },
  Diamond: {
    className: "bg-green-100 text-black border-green-300",
    icon: <FaGem className="text-green-500 text-4xl" />,
    color: "#10b981",
  },
};

Modal.setAppElement("#root");

const Achievements = ({ token, baseUrl, profile }) => {
  const dispatch = useDispatch();
  const {
    list: achievements,
    popupList,
    status,
  } = useSelector((state) => state.achievements);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalSize, setModalSize] = useState({
    width: "95vw",
    height: "80vh",
  });

  useEffect(() => {
    if (profile?._id && token && baseUrl) {
      dispatch(fetchAchievements({ userId: profile._id, token, baseUrl }));
      dispatch(markPopupsSeen({ userId: profile._id, token, baseUrl }));
    }
  }, [profile, token, baseUrl, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setModalSize({
        width: isMobile ? "95vw" : "80vw",
        height: isMobile ? "80vh" : "fit-content",
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "failed") {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="px-3 lg:px-16 font-openSans rounded-lg">
      <div className="text-center flex gap-3 sm:gap-4 bg-gray-100 rounded-md shadow-md">
        <span className="text-lg w-24 font-semibold border flex justify-center items-center bg-gray-300 p-4 text-gray-900">
          <GrAchievement className="lg:text-6xl text-3xl text-red-500" />
        </span>
        <div className="flex flex-col py-3 sm:p-3">
          <p className="text-gray-700 text-left text-xs sm:text-lg">
            Unlock new achievements and showcase your milestones! Click below to
            see your progress.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 text-nowrap w-36 p-3 self-start bg-black text-white font-semibold  rounded-md transition transform text-xs sm:text-sm hover:scale-105 shadow-lg"
          >
            Show Progress
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            width: modalSize.width,
            height: modalSize.height,
            position: "fixed",
            overflowY: "auto",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            background: "white",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-2 right-2 text-black hover:text-black bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          <FiX size={24} />
        </button>
        <span className="text-sm md:text-3xl text-start flex font-semibold font-horizon mb-3 text-black">
          <FiAward className="mr-3 text-yellow-300" size={28} />
          Your Achievements
        </span>
        <p className="my-3 text-black">
          Track your progress and earn badges as you reach milestones.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 sm:px-6 gap-6">
          {achievements.map((achievement, index) => {
            const badge = badgeDetails[achievement.badge] || {
              className: "bg-gray-200 text-black",
              icon: null,
              color: "#6b7280",
            };
            const progressColor = achievement.completed
              ? "#10b981"
              : badge.color;

            return (
              <div
                key={index}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  achievement.completed ? "ring-2 ring-green-500" : ""
                }`}
              >
                <div
                  className="p-2 text-white"
                  style={{ backgroundColor: badge.color }}
                >
                  <div className="flex flex-col justify-between items-center">
                    <h3 className="font-bold text-lg">{achievement.badge}</h3>
                    {achievement.completed && (
                      <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                        COMPLETED
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-6 text-center flex flex-col items-center">
                  <div className="w-20 h-20 mb-4">
                    <CircularProgressbar
                      value={achievement.progress}
                      text={`${achievement.progress}%`}
                      styles={buildStyles({
                        textSize: "18px",
                        textColor: "#111",
                        pathColor: progressColor,
                        trailColor: "#e5e7eb",
                      })}
                    />
                  </div>
                  <div className="mb-2">{badge.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {achievement.description}
                  </p>
                  <div className="flex  justify-between w-full text-xs text-gray-600 border-t pt-3">
                    <span className="flex items-center gap-1">
                      <FiTrendingUp /> Sales Needed:
                    </span>
                    <span className="font-semibold ">{achievement.count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default Achievements;
