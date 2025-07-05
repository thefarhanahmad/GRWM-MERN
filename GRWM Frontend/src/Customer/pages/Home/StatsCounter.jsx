import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const StatsCounter = () => {
  const [brands, setBrands] = useState(0);
  const [products, setProducts] = useState(0);
  const [customers, setCustomers] = useState(0);

  const formatNumber = (num) => {
    return num.toLocaleString("en-US") + "+";
  };

  useEffect(() => {
    const brandInterval = setInterval(() => {
      setBrands((prev) => (prev < 20 ? prev + 1 : prev));
    }, 100);

    const productInterval = setInterval(() => {
      setProducts((prev) => (prev < 200 ? prev + 5 : prev));
    }, 50);

    const customerInterval = setInterval(() => {
      setCustomers((prev) => (prev < 1000 ? prev + 10 : prev));
    }, 10);

    return () => {
      clearInterval(brandInterval);
      clearInterval(productInterval);
      clearInterval(customerInterval);
    };
  }, []);

  return (
    <div className=" lg:pl-20 py-10 font-openSans">
      <div className=" mx-auto flex flex-col items-center gap-4 sm:gap-8 ">
        <div className=" mx-auto flex flex-col  sm:flex-row lg:gap-20 gap-4 sm:gap-8 text-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-5xl  text-black font-bold">
              {formatNumber(brands)}
            </h2>
            <p className="text-black mt-1 text-xs sm:text-sm md:text-lg">
              FASHION BRANDS
            </p>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl md:text-5xl  text-black font-bold">
              {formatNumber(customers)}
            </h2>
            <p className="text-black text-xs sm:text-sm md:text-lg mt-1 ">
              UNIQUE FINDS
            </p>
          </div>
        </div>
        <Link
          to="/addproducts"
          className="bg-black text-white font-helveticaWorld py-1 max-xs:w-20 text-center text-nowrap px-2 sm:px-5 lg:px-6  text-sm md:px-10  md:text-xl transition"
        >
          Sell Now
        </Link>
      </div>
    </div>
  );
};

export default StatsCounter;
