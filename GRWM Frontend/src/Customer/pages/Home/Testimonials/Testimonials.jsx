import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const Testimonials = () => {
  const scrollRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const [index, setIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/testimonial`);
        if (response.data.success) {
          setTestimonials(response.data.data);
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        setHasError(true);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && testimonials.length > 0) {
        const container = scrollRef.current;
        const card = container.querySelector("div.snap-start");
        const cardWidth = card?.offsetWidth + 24 || 0; // 24px = gap-6

        if (index === testimonials.length - 1) {
          container.scrollTo({ left: 0, behavior: "smooth" });
          setIndex(0);
        } else {
          container.scrollTo({
            left: cardWidth * (index + 1),
            behavior: "smooth",
          });
          setIndex((prev) => prev + 1);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [index, testimonials]);

  if (hasError) return null;

  return (
    <div className="lg:px-16 p-3 py-7 md:py-9  mx-auto">
      <h2 className="font-horizon mb-6 font-semibold uppercase text-black lg:text-3xl text-xl">
        Testimonials
      </h2>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth  scrollbar-hide no-scrollbar snap-x snap-mandatory gap-6 sm:px-4 md:px-0"
      >
        {testimonials.map((item) => (
          <div
            key={item._id}
            className="snap-start shrink-0 
              w-full sm:w-[85%] md:w-[65%] lg:w-[calc((100%/3)-16px)]
              bg-gray-100 rounded-xl h-36 shadow-md p-4  flex justify-between items-start
              transition-transform duration-500 ease-in-out"
          >
            <div className="flex-1 font-openSans ">
              <p className="font-semibold text-lg mb-1">{item.title}</p>
              <p className="text-sm text-gray-900  line-clamp-3">
                {item.description}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 ml-4">
              <img
                src={
                  item.user?.image ||
                  "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
                }
                alt={item.user?.name || "Profile"}
                className="md:w-20 w-16 h-16 md:h-20 rounded-full object-cover border border-gray-300"
              />
              <p className="text-sm font-helveticaWorld text-black">
                {item.user?.name || "Anonymous"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <style jsx={true}>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Testimonials;
