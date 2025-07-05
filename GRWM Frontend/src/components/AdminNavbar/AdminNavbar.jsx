import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose, AiOutlineBell, AiOutlineMail, AiOutlineBulb } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/auth/userSlice";
import { showToast, ToastComponent } from "../../components/Toast/Toast"; // Import Toast
import Logo from "../../assets/Logo/GRMW-Logo.png"; // Ensure the path is correct

const AdminNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);

    // Logout Function (Only Once)
    const handleLogout = () => {
        localStorage.removeItem("user"); // Clear specific key only
        dispatch(logout());
        showToast("success", "Logged out successfully!"); // Show success toast

        // Delay navigation to allow toast to display
        setTimeout(() => {
            navigate("/"); // Redirect to home
        }, 1000);
    };

    // Check if User is Logged In
    useEffect(() => {
        const storedUser = localStorage.getItem("user"); // Check if user exists in localStorage
        if (!storedUser) {
            navigate("/"); // Redirect to home if user is null
        }
    }, [navigate]);

    // Toggle Dark Mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <div className="w-full shadow-md border">
            <ToastComponent /> {/* Toast notification component */}

            <nav className="flex items-center justify-between px-4 md:px-6 lg:px-12 py-2">
                {/* Mobile Menu Icon */}
                <div className="md:hidden">
                    <AiOutlineMenu size={24} className="cursor-pointer text-black" onClick={() => setIsMenuOpen(true)} />
                </div>

                {/* Logo */}
                <div className="flex items-center">
                    <Link to="/admin/dashboard">
                        <img src={Logo} alt="GRMW Logo" className="h-6 md:h-14" />
                    </Link>
                </div>

               

                {/* Right Section */}
                <div className="flex items-center gap-3 md:gap-6">
                   
                    {/* User Profile / Auth Buttons */}
                    {user ? (
                        <div className="flex items-center gap-6">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white text-md">
                                {user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-black text-white px-6 py-2 text-sm md:px-10 md:py-3 md:text-md transition"
                            >
                                Logout
                            </button>
                        </div>
                    ) : null}
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000]">
                    <div className="fixed left-0 top-0 h-full w-64 bg-gray-100 shadow-lg p-8 transition-transform transform translate-x-0">
                        {/* Close Button */}
                        <AiOutlineClose
                            size={24}
                            className="absolute top-4 right-4 cursor-pointer text-black"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Mobile Navigation Links */}
                        <ul className="mt-8 space-y-4">
                            <li>
                                <Link to="/admin/dashboard" className="block text-lg text-black">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/products" className="block text-lg text-black">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="text-red-500 text-lg">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNavbar;
