import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Top = () => {
  const user = useSelector((state) => state.user.user);

  return (
    <div className="w-full">
      {/* Top Bar */}
      <div className="bg-black text-white text-center lg:px-0 px-3 py-3 text-sm lg:text-md">
        {user ? (
          <p className="lg:text-md text-sm">
            Welcome back! Enjoy shopping with exclusive deals.
          </p>
        ) : (
          <p className="lg:text-md text-sm">
            Sign up and get 10% off your first order!{" "}
            <Link
              to="/signup"
              className="underline text-blue-400 pl-1 hover:text-blue-300"
            >
              Sign up Now
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Top;
