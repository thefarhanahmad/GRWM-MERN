import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from "./Header/Header";
import Brand from "./Brand/Brand";
import AllProducts from "./AllProducts/Allproducts";
import Spotlight from "./AllProducts/Spotlight";
import FollowedSellers from "../Followed_Sellers/FollowedSellers";
import Price from "./AllProducts/Price";
import Testimonials from "./Testimonials/Testimonials";
import StatsCounter from "./StatsCounter";
import HomePopupModal from "../../components/HomePopupModal";
import { useDispatch, useSelector } from "react-redux";
import {
  closeModal,
  openModal,
  setFirstOpenFalse,
} from "../../../redux/slices/modalSlice";
import OccassionProducts from "./OccasionProducts";

const Home = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [counter, setCounter] = useState(0);

  // Popup Modal
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const { showModal, firstOpen } = useSelector((state) => state.modal);

  useEffect(() => {
    if (!token && firstOpen) {
      dispatch(openModal());
      dispatch(setFirstOpenFalse());
    }
  }, [token, firstOpen, dispatch]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };
  // Popup Modal

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/slider`
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          setSliderImages(response.data.data.slice(0, 4)); // Limit to 4 images
        }
      } catch (error) {
        console.error("Error fetching slider data:", error);
      }
    };

    fetchSliders();
  }, []);

  useEffect(() => {
    let interval;
    if (sliderImages.length > 0) {
      setCounter(0);
      interval = setInterval(() => {
        setCounter((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sliderImages]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
  };

  return (
    <div>
      <Header />

      <div className="w-full  bg-no-repeat overflow-hidden">
        {sliderImages.length > 1 ? (
          <Slider {...settings}>
            {sliderImages.map((slide, index) => (
              <div key={index} className="relative overflow-hidden">
                <img
                  src={slide.image}
                  alt={`Slider ${index + 1}`}
                  className="w-full h-[250px] md:h-[550px] md:object-cover"
                />
                {index === 0 && (
                  <div className="absolute w-full  h-full px-2 justify-start items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
                    <div className="text-white py-4 rounded-lg">
                      <StatsCounter />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Slider>
        ) : (
          sliderImages.map((slide, index) => (
            <div key={index} className="relative overflow-hidden">
              <img
                src={slide.image}
                alt={`Slider ${index + 1}`}
                className="w-full h-[220px] sm:h-[320px] md:h-[550px] md:object-cover"
              />
              <div className="absolute w-full  h-full px-2  justify-start items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
                <div className="text-white py-4 rounded-lg">
                  <StatsCounter />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Brand />
      <Spotlight />
      <Price />
      <AllProducts />
      <OccassionProducts />
      <FollowedSellers />
      <Testimonials />
      <HomePopupModal show={showModal} onClose={handleCloseModal} />
    </div>
  );
};

export default Home;
