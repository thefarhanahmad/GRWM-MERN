import React from "react";
import { motion } from "framer-motion";
import BgImg from "../../../assets/Image/about-bg.jpg";
import LeftSideImage from "../../../assets/Image/aboutImage.jpg";

const About = () => {
  return (
    <div className="bg-white font-openSans text-black">
      {/* Hero Section */}
      <div
        className="relative md:h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${BgImg})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        {/* Main Content */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col md:flex-row h-full mx-auto"
        >
          {/* Left Side: Full-height Image */}
          <div className="w-full md:w-1/2 h-[50vh] md:h-full overflow-hidden">
            <img
              src={LeftSideImage}
              alt="Side visual"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side: Text Content */}
          <div className="w-full md:w-1/2 flex items-center justify-center px-3 sm:px-6 md:px-8 py-6 md:py-12">
            <div className="text-white text-justify md:text-lg space-y-4">
              <h1 className="text-lg font-horizon md:text-3xl text-center md:text-start font-semibold font-horizon mb-3 ">
                Welcome to <span className="text-white">GRWM</span>
              </h1>
              <p>
                GRWM began as a homegrown startup sparked by a relatable college
                dilemma. When <strong>Sanvi Jain</strong>, our Co-Founder, faced
                the challenge of moving out with too many clothes and nowhere to
                take them, she and her best friend{" "}
                <strong>Ananya Agrawal</strong> envisioned a smarter solution.
                What if you could declutter, shop affordably, and earn at the
                same time? That idea grew into GRWM — a platform where fashion
                finds new life.
              </p>
              <p>
                Today, we’re more than a marketplace; we’re building a movement
                that empowers young people to shop sustainably and stylishly.
                We’re not just about pre-loved clothing—we’re about redefining
                fashion. As pioneers in India’s circular fashion space, we
                empower young adults to experiment with style while embracing
                environmental responsibility.
              </p>
              <p>
                Refresh your wardrobe effortlessly, discover one-of-a-kind
                finds, and earn by selling what no longer fits your vibe—all
                without compromising on style or breaking the bank.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
