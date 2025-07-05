import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import "../../../components/style/style.css";
import { Link } from "react-router-dom";

const FollowersFollowingModal = ({ vendorId, activeTab, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchFollowersFollowing = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${BASE_URL}/followers-following/${vendorId}`
                );
                setFollowers(response.data.data.followers);
                setFollowing(response.data.data.following);
            } catch (err) {
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        if (vendorId) {
            fetchFollowersFollowing();
        }
    }, [vendorId]);

    // Close modal on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    let leaveTimeout;

    const handleMouseLeave = () => {
        leaveTimeout = setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleMouseEnter = () => {
        clearTimeout(leaveTimeout);
    };

    if (!vendorId) return null;

    const users = activeTab === "followers" ? followers : following;

    return (
        <div className="fixed inset-0 lg:px-0 px-6 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
            <div
                ref={modalRef}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                className="bg-white rounded-lg w-full max-w-md h-[60vh] max-h-[80vh] shadow-xl overflow-hidden relative flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 font-semibold hover:text-black text-2xl"
                >
                    <RxCross2 />
                </button>

                <h2 className="text-lg font-semibold text-center py-4 border-b sticky top-0 bg-white z-10">
                    {activeTab === "followers" ? "Followers" : "Following"}
                </h2>

                <div className="overflow-y-auto flex-grow hide-scrollbar px-4 py-2">
                    {loading ? (
                        <p className="text-center text-gray-500 mt-10">Loading...</p>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : users.length === 0 ? (
                        <p className="text-center text-lg text-gray-700 mt-10">
                            No {activeTab} found.
                        </p>
                    ) : (
                        <ul>
                            {users.map((user) => (
                                <li
                                    key={user._id}
                                    className="flex items-center justify-between gap-3 py-2 border-b hover:bg-gray-50 transition-all cursor-pointer"
                                >
                                    <Link
                                        to={`/vendor/profile/${user._id}`}
                                        className="flex items-center gap-3 flex-grow"
                                        onClick={onClose}
                                    >
                                        {user.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center text-xl justify-center text-black uppercase font-semibold">
                                                {user.email?.charAt(0)}
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <p className="text-md text-gray-900">{user.name}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowersFollowingModal;
