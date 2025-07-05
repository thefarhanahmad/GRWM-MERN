import React, { useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Login from "./auth/Login/Login";

import Signup from "./auth/Signup/Signup";

import AdminPages from "./AdminPages";
import Home from "./Customer/pages/Home/Home";
import Footer from "./components/Footer/Footer";
import Cart from "./Customer/pages/Cart/Cart";
import Wishlist from "./Customer/pages/Wishlist/Wishlist";
import ProductDetails from "./Customer/pages/Home/ProductDetails/ProductDetails";
import Profile from "./Customer/pages/Profile/Profile";
import BuyNow from "./Customer/pages/Buy/BuyNow";
import AddProducts from "./Customer/pages/AddProducts/AddProducts";
import Products from "./Customer/pages/Seller_AllProducts/Products";
import EditProduct from "./Customer/pages/Seller_AllProducts/EditProducts";

import Notifications from "./Customer/pages/Notifications/Notifications";
import Orders from "./Customer/pages/Orders/Orders";
import SellProducts from "./Customer/pages/SellProducts/SellProducts";
import FilterProducts from "./Customer/pages/Filter/FilterProducts";
import Balance from "./Customer/pages/Balance/Balance";
import ChatPage from "./Customer/pages/ChatDetails/ChatPage";
import ChatDetails from "./Customer/pages/ChatDetails/ChatDetails";
import VendorProfile from "./Customer/pages/VendorProfile/VendorProfile";
import Settings from "./Customer/pages/Settings/Settings";
import WardrobeProducts from "./Customer/pages/Wardrobe/WardrobeProducts";
import VerifyOtp from "./auth/VerifyOtp";
import VerifyOtpResetPassword from "./auth/VerifyOtpResetPassword";
import HelpCenter from "./Customer/pages/Settings/HelpCenter";
import TermsCondition from "./Customer/pages/Settings/TermsCondition";
import About from "./Customer/pages/AboutUs/About";
import Contact from "./Customer/pages/Contact/Contact";
import FAQs from "./Customer/pages/FAQs/FAQs";
import ReturnPolicy from "./Customer/pages/ReturnPolicy/ReturnPolicy";
import { useDispatch } from "react-redux";
import { logout } from "./redux/auth/userSlice";
import VerifyGoogleAccount from "./auth/VerifyGoogleAccount";
import ScrollToTop from "./components/ScrollToTop";
import PaymentSuccess from "./Customer/pages/Payment/PaymentSucces";
import EditProducts from "./Customer/pages/EditProducts/EditProducts";
import MobileBottomNav from "./components/Navbar/MobileBottomNav";
import Terms from "./Customer/pages/Terms";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // ✅ This useEffect checks for expired token on app load
  useEffect(() => {
    const tokenExpiry = localStorage.getItem("tokenExpiry");
    if (tokenExpiry && Date.now() > Number(tokenExpiry)) {
      // Token has expired
      dispatch(logout());
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <ScrollToTop />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route
          path="/verify-google-account"
          element={<VerifyGoogleAccount />}
        />
        <Route path="/reset-otp" element={<VerifyOtpResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route
          path="/product/details/:productId"
          element={<ProductDetails />}
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buynow/:product_id?" element={<BuyNow />} />
        <Route path="/addproducts" element={<AddProducts />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/seller/hub" element={<Products />} />
        <Route path="/purchases" element={<Orders />} />
        <Route path="/orders" element={<SellProducts />} />
        <Route path="/product/edit/:productId" element={<EditProducts />} />
        <Route path="/products" element={<FilterProducts />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/chat/:type" element={<ChatPage />}>
          <Route path=":receiverId" element={<ChatDetails />} />
        </Route>

        <Route path="/Wardrobe/products" element={<WardrobeProducts />} />
        <Route path="/vendor/profile/:id" element={<VendorProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/privacypolicy" element={<TermsCondition />} />
        <Route path="/terms&conditions" element={<TermsCondition />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/returnpolicy" element={<ReturnPolicy />} />
        <Route path="/helpcenter" element={<HelpCenter />} />

        <Route path="/admin/*" element={<AdminPages />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNav />}
    </>
  );
}

export default App;
