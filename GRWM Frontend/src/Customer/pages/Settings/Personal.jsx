import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FiLoader, FiEdit2, FiCamera } from "react-icons/fi";
import toast from "react-hot-toast";

const StarRating = ({ rating }) => {
  const totalStars = 5;
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalStars }, (_, index) => (
        <span
          key={index}
          className={
            index < rating ? "text-black text-lg" : "text-gray-400 text-lg"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Personal = ({ setName, setProfileImage }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    phone: "",
    email: "",
    profileImage: null,
    previewImage: null,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyDisabled, setVerifyDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  console.log("profile in personal page ", profile);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data.data;
        setProfile(data);
        setUpdatedProfile({ ...data, previewImage: data.profileImage });
        setName(data.name);
        setProfileImage(data.profileImage);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        setLoading(false);
      });
  }, [token, setName, setProfileImage, setOtp]);

  useEffect(() => {
    if (profile) {
      setUpdatedProfile({ ...profile, previewImage: profile.profileImage });
    }
  }, [profile, otp]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({ ...prev, [name]: value }));
    if (name === "name") {
      setName(value);
    }
  };

  const handleCancel = () => {
    setUpdatedProfile({ ...profile, previewImage: profile?.profileImage });
    setEditing(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setUpdatedProfile((prev) => ({
        ...prev,
        profileImage: e.target.files[0],
        previewImage: URL.createObjectURL(e.target.files[0]),
      }));
    }
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("name", updatedProfile.name);
    formData.append("phone", updatedProfile.phone);
    formData.append("email", updatedProfile.email);
    if (updatedProfile.profileImage) {
      formData.append("profileImage", updatedProfile.profileImage);
    }

    axios
      .put(
        `${import.meta.env.VITE_BASE_URL}/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setProfile(response.data.data);
        setEditing(false);
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        setEditing(false);
      });
  };

  //   SMS logics
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/send-phone-otp`,
        { phone: updatedProfile.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOtpSent(true);
      setVerifyDisabled(true);
      setResendTimer(300);
      setTimeout(() => setVerifyDisabled(false), 300000);
    } catch (err) {
      console.error("Error sending OTP:", err);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/verify-phone-otp`,
        { phone: updatedProfile.phone, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Phone number verified!");
        setProfile((prev) => ({ ...prev, phoneVerified: true }));
        setUpdatedProfile((prev) => ({ ...prev, phoneVerified: true }));
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error("Invalid OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
    }
    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  return (
    <div className="relative bg-white max-w-6xl items-center p-3 max-xs:mt-4 mt-8 mb-4 lg:ml-20">
      <div className="flex justify-start gap-4 lg:gap-10 ">
        <div className="relative">
          <img
            src={
              updatedProfile?.previewImage ||
              "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
            }
            alt="Profile"
            className="lg:w-36 lg:h-36 w-20 h-20 rounded-full object-cover border"
          />
          {editing && (
            <label className="absolute bottom-3 z-[1000] right-2 text-black text-2xl cursor-pointer">
              <FiCamera />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        <div>
          <div className="flex gap-1 sm:gap-4 mt-2">
            <span className="font-semibold text-nowrap text-xs sm:text-sm">
              {updatedProfile?.followers?.length} Followers
            </span>
            <span className="font-semibold text-nowrap text-xs sm:text-sm">
              {updatedProfile?.following?.length} Following
            </span>
          </div>
          <div className="font-semibold text-xs sm:text-sm mt-2">
            <StarRating rating={updatedProfile?.ratings?.averageRating || 0} />
          </div>

          {updatedProfile?.ratings?.averageRating > 0 && (
            <div className="font-bold mt-4 flex items-center gap-4 text-xs sm:text-sm">
              <p className="bg-green-200 text-green-600  px-3 rounded-lg">
                {updatedProfile?.ratings?.averageRating} / 5
              </p>
              <p>{updatedProfile?.ratings?.numberOfRatings} Reviews</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mt-5 sm:mt-10 md:px-4">
        {["name", "phone", "email"].map((field) => (
          <div key={field}>
            <label className="block text-gray-600 font-medium mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={updatedProfile[field]}
              onChange={handleInputChange}
              readOnly={!editing}
              className="border border-gray-400 p-2 rounded w-full outline-none hover:outline-none"
            />

            {/* Phone verification logic */}
            {field === "phone" && (
              <div className="flex items-center mt-2">
                {!profile?.phoneVerified ? (
                  <div className="mt-2 space-y-2">
                    {!otpSent ? (
                      <button
                        onClick={handleSendOtp}
                        disabled={verifyDisabled}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        Verify Now
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter OTP"
                          className="border p-2 w-full rounded"
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={otp.length !== 6}
                          className={`w-full px-3 py-2 rounded font-medium ${
                            otp.length !== 6
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {verifying ? "Verifying..." : "Verify OTP"}
                        </button>
                        {resendTimer > 0 && (
                          <p className="text-sm text-gray-500 text-center">
                            Resend OTP in {Math.floor(resendTimer / 60)}:
                            {String(resendTimer % 60).padStart(2, "0")} minutes
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="ml-2 text-green-600 font-semibold">
                    ✔ Verified
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <FiEdit2
        size={22}
        onClick={() => setEditing(!editing)}
        className="absolute top-4 right-4 text-black cursor-pointer"
      />

      <div className="flex justify-end gap-6 mt-12">
        {editing && (
          <button
            onClick={handleCancel}
            className="bg-white text-black border border-black px-4 py-2 rounded-sm"
          >
            Cancel
          </button>
        )}
        {editing && (
          <button
            onClick={handleSubmit}
            className=" bg-black text-white px-4 py-2 rounded-sm"
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};

export default Personal;
