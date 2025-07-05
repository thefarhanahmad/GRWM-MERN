import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastComponent } from "../../../../components/Toast/Toast";
import PostWishlist from "../../../components/wishlist/PostWishlist";
import PostCart from "../../../components/cart/PostCart";
import BuyNowButton from "../../../components/BuyNowButton/BuyNowButton";
import ProductCard from "../../../components/ProductCard";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const RelatedProducts = ({ productId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/related/products/${productId}`
        );
        const filteredProducts = response.data?.data
          .filter((product) => product.vendor?._id !== user?._id)
          .filter((product) => product.soldStatus === false); // exclude sold-out products

        setRelatedProducts(filteredProducts || []);
      } catch (err) {
        setError("Network error. Failed to load related products.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelatedProducts();
    }
  }, [productId, user]);

  // Hide the section if there's an error or no in-stock products
  if (error || !relatedProducts.length) return null;

  return (
    <div className="px-3 lg:px-16 mb-6">
      <ToastComponent />
      <h2 className="font-horizon mb-6 mt-4 uppercase font-semibold text-black lg:text-3xl text-xl">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {relatedProducts?.slice(0, 4)?.map((product) => (
          <ProductCard key={product._id} product={product} user={user} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
