import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white font-openSans pt-6 pb-4 px-6 md:px-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        {/* Company Info */}
        <div className="flex flex-col">
          <Link
            to="/"
            className="text-xl md:text-3xl font-bold md:mb-2 font-horizon"
          >
            GRWM
          </Link>
          <div className="hidden md:flex flex-col  w-full text-gray-300 text">
            <span>
              Your go-to destination for selling old faves & finding new gems.
            </span>
            <span>For the planet, for your wardrobe.</span>
            <span>Styled by you. Styled by nature.</span>
          </div>
        </div>

        {/* Quick Links + Customer Support (Mobile 2-column layout) */}
        <div className="grid grid-cols-2 gap-6 md:contents">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold lg:text-center mb-3 md:mb-4">
              Quick Links
            </h3>
            <ul className="text-gray-300 space-y-2 md:space-y-4 lg:text-center">
              {[
                "Home",
                "Shop",
                "About Us",
                "Contact Us",
                "Settings",
                "Selling Hub",
              ].map((item, index) => {
                let path = "/";
                if (item === "Home") path = "/";
                else if (item === "Shop") path = "/products";
                else if (item === "Contact Us") path = "/contact";
                else if (item === "Selling Hub") path = "/addproducts";
                else if (item === "Settings") path = "/settings";
                else path = `/${item.toLowerCase().replace(/\s+/g, "")}`;

                return (
                  <li key={index}>
                    <Link to={path} className="hover:text-white transition">
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg lg:text-center font-semibold mb-3 md:mb-4">
              Customer Support
            </h3>
            <ul className="text-gray-300 space-y-2 md:space-y-4 lg:text-center">
              {[
                "FAQs",
                "Shipping Info",
                "Help Center",
                "Terms & Conditions",
                "Track Order",
              ].map((item, index) => {
                let path = `/${item.toLowerCase().replace(/\s+/g, "")}`;
                if (item === "Shipping Info" || item === "Track Order") {
                  path = "/purchases";
                }

                return (
                  <li key={index}>
                    <Link to={path} className="hover:text-white transition">
                      {item}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="lg:text-center">
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex lg:justify-center gap-4">
            {[
              { icon: <FaFacebookF />, link: "#" },
              {
                icon: <FaInstagram />,
                link: "https://www.instagram.com/grwm_official.in?igsh=ZTFnanJiZGhqZXhq",
              },
              { icon: <FaLinkedinIn />, link: "#" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.link}
                className="text-gray-300 hover:text-white text-xl transition"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-600 mt-10 pt-3 flex flex-col md:flex-row md:justify-between text-gray-300 text-md flex-wrap gap-2 text-left">
        <p>Scrolled this far? You clearly have taste!</p>
        <p>
          © {new Date().getFullYear()} The GRWM. All rights reserved. Powered by
          Focal Experts LLP.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
