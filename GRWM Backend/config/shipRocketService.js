const axios = require("axios");

const getShiprocketToken = async () => {
  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }
  );

  return response.data.token;
};

// ✅ Accept buyerAddress and sellerAddress separately
const createShiprocketOrder = async (
  order,
  product,
  buyerAddress,
  sellerAddress,
  buyer,
  token
) => {
  const payload = {
    order_id: order._id.toString(),
    order_date: new Date().toISOString().slice(0, 10),

    // ✅ Seller's pickup location
    pickup_location: sellerAddress.pickupLocationName || "Default",
    pickup_postcode: sellerAddress.postalCode,
    pickup_state: sellerAddress.state,
    pickup_city: sellerAddress.city,
    pickup_address: sellerAddress.street,
    pickup_country: sellerAddress.country || "India",

    // ✅ Buyer's shipping address
    billing_customer_name: buyerAddress.fullName,
    billing_address: buyerAddress.street,
    billing_city: buyerAddress.city,
    billing_pincode: buyerAddress.postalCode,
    billing_state: buyerAddress.state,
    billing_country: buyerAddress.country,
    billing_email: buyer.email,
    billing_phone: buyerAddress.phoneNumber,

    shipping_is_billing: true,

    order_items: [
      {
        name: product.title,
        sku: product._id.toString(),
        units: 1,
        selling_price: order.amount,
      },
    ],
    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.amount,
    length: 10,
    breadth: 10,
    height: 1,
    weight: 0.5,
  };

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ✅ Get live tracking status from Shiprocket
const getShiprocketTrackingStatus = async (awbCode, token) => {
  try {
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return (
      response.data?.tracking_data?.shipment_track_activities?.[0]
        ?.current_status || "Not Available"
    );
  } catch (error) {
    console.error("Error fetching tracking status:", error.message);
    return "Tracking Unavailable";
  }
};

const createReverseShiprocketOrder = async (
  order,
  product,
  buyerAddress,
  sellerAddress,
  buyer,
  token
) => {
  const payload = {
    order_id: `RET-${order._id}`,
    order_date: new Date().toISOString().slice(0, 10),

    // ✅ Pickup will be from the **customer**
    pickup_location: buyerAddress.pickupLocationName || "Customer",
    pickup_postcode: buyerAddress.postalCode,
    pickup_state: buyerAddress.state,
    pickup_city: buyerAddress.city,
    pickup_address: buyerAddress.street,
    pickup_country: buyerAddress.country || "India",

    // ✅ Shipping will be to the **seller**
    billing_customer_name: sellerAddress.fullName || sellerAddress.name,
    billing_address: sellerAddress.street,
    billing_city: sellerAddress.city,
    billing_pincode: sellerAddress.postalCode,
    billing_state: sellerAddress.state,
    billing_country: sellerAddress.country || "India",
    billing_email: sellerAddress.email || sellerAddress.emailId,
    billing_phone: sellerAddress.phoneNumber,

    shipping_is_billing: true,
    return_order: true, // ✅ Important

    order_items: [
      {
        name: product.title,
        sku: product._id.toString(),
        units: 1,
        selling_price: order.amount,
      },
    ],

    payment_method: "Prepaid", // Usually returns are prepaid
    sub_total: order.amount,
    length: 10,
    breadth: 10,
    height: 1,
    weight: 0.5,
  };

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

module.exports = {
  getShiprocketToken,
  createShiprocketOrder,
  getShiprocketTrackingStatus,
  createReverseShiprocketOrder,
};
