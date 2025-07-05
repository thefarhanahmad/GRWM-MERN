const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Address = require("../models/Address");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");
const sendEmail = require("../config/sendEmail");
const Coupon = require("../models/dicountCoupon");
const User = require("../models/User");
const { default: axios } = require("axios");
const {
  getShiprocketToken,
  createShiprocketOrder,
} = require("../config/shipRocketService");
const ReturnRequest = require("../models/ReturnRequest");

// ✅ Create Order - PhonePe
const createOrder = async (req, res) => {
  try {
    const { products, amount, addressId } = req.body;
    const customer_id = req.user.userId;

    if (
      !products ||
      !Array.isArray(products) ||
      products.length === 0 ||
      !amount ||
      !addressId
    ) {
      return res.status(400).json({
        success: false,
        message: "Products, amount, and addressId are required.",
      });
    }

    const user = await User.findById(customer_id);

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    if (!user?.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number before placing an order.",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: customer_id,
    });
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or does not belong to the user.",
      });
    }

    const merchantTransactionId = `txn_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`;
    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: customer_id.toString(),
      amount: amount * 100,
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URL}?txnId=${merchantTransactionId}`,
      redirectMode: "GET",
      callbackUrl: process.env.PHONEPE_ORDER_CALLBACK_URL,
      mobileNumber: user.phone,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const xVerify =
      crypto
        .createHash("sha256")
        .update(base64Payload + "/pg/v1/pay" + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const response = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": process.env.PHONEPE_MERCHANT_ID,
        },
      }
    );

    if (
      response.data.success !== true ||
      !response.data.data?.instrumentResponse?.redirectInfo?.url
    ) {
      return res.status(500).json({
        success: false,
        message: "PhonePe order creation failed.",
        response: response.data,
      });
    }

    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

    // ✅ Create one Order per product
    for (const item of products) {
      const product = await Product.findById(item.product_id);
      if (!product) continue;

      const order = new Order({
        customer_id,
        vendor_id: product.vendor,
        product_id: item.product_id,
        phonepe_transaction_id: merchantTransactionId, // all orders share same txn ID
        status: "pending",
        deliveryStatus: "pending",
        amount: item.price,
        deliveryAddress: addressId,
      });

      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: "Orders created successfully.",
      redirectUrl,
    });
  } catch (error) {
    console.error("❌ createOrder error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { merchantTransactionId } = req.body;

    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction ID.",
      });
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const xVerify =
      crypto
        .createHash("sha256")
        .update(
          `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
        )
        .digest("hex") +
      "###" +
      saltIndex;

    const response = await axios.get(
      `${process.env.PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    const status = response?.data?.data?.state;
    if (status !== "COMPLETED") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed." });
    }

    // ✅ Find all orders with the transaction ID
    const orders = await Order.find({
      phonepe_transaction_id: merchantTransactionId,
    });
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found." });
    }

    // ✅ Mark all orders as paid
    await Order.updateMany(
      { phonepe_transaction_id: merchantTransactionId },
      { status: "paid" }
    );

    const buyer = await User.findById(orders[0].customer_id);
    if (!buyer) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const buyerAddress = await Address.findById(orders[0].deliveryAddress);
    if (!buyerAddress) {
      return res
        .status(404)
        .json({ success: false, message: "Buyer's address not found." });
    }

    // ✅ Get Shiprocket token once
    const shiprocketToken = await getShiprocketToken();

    // ✅ Process each product's vendor update and seller email
    for (const order of orders) {
      const product = await Product.findById(order.product_id).populate(
        "vendor"
      );
      if (!product) continue;
      await Product.findByIdAndUpdate(product._id, { soldStatus: true });
      const seller = product.vendor;
      // ✅ Get seller's address
      const sellerAddress = await Address.findOne({ userId: seller._id });
      if (!sellerAddress) {
        console.warn(
          `Seller address not found for ${seller._id}. Skipping Shiprocket.`
        );
        continue;
      }

      // ✅ Create Shiprocket order
      const shiprocketOrder = await createShiprocketOrder(
        order,
        product,
        buyerAddress,
        sellerAddress,
        buyer,
        shiprocketToken
      );

      // ✅ Save tracking info (optional)
      if (shiprocketOrder?.shipment_id) {
        order.shiprocket_order_id = shiprocketOrder.order_id;
        order.awb_code = shiprocketOrder.awb_code;
        order.shipment_status = "NEW";
        order.tracking_url = shiprocketOrder.tracking_url;
        order.label_url = shiprocketOrder.label_url;
        order.deliveryStatus = "Pending";
        await order.save();
      }

      await User.findByIdAndUpdate(
        product.vendor._id,
        {
          $inc: {
            totalSold: 1,
            balance: order.amount,
          },
        },
        { new: true }
      );

      // ✅ Send email to seller
      const sellerEmail = product.vendor.email;
      const sellerName = product.vendor.name;

      const sellerSubject = "🎉 Your Product Has Been Sold!";
      const sellerMessage = `
   <div style="background-color: #000000; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 10px;">
     <h2 style="text-align: center; color: #ffffff;">🎉 Great News, ${sellerName}!</h2>
 
     <p style="font-size: 16px; margin-top: 20px;">
       Your product <strong>${product.title}</strong> has just been <span style="color: #00ff99;">sold successfully</span>! 🚀
     </p>
 
     <div style="background-color: #ffffff; color: #000000; padding: 20px; margin: 20px 0; border-radius: 8px;">
       <p style="margin: 0 0 10px 0;"><strong>Order ID:</strong> ${order._id}</p>
       <p style="margin: 0;"><strong>Amount Earned:</strong> ₹${order.amount}</p>
     </div>
 
     <p style="font-size: 14px;">
       Thank you for selling with us! Keep listing awesome products and growing your business.
     </p>
 
     <hr style="margin: 30px 0; border: none; border-top: 1px solid #444444;">
 
     <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
       Need help or have questions? Just reply to this email — we're here for you!
     </p>
   </div>
 `;

      await sendEmail(sellerEmail, sellerSubject, sellerMessage);
      // ✅ Add buyer notification for each order
      await Notification.create({
        userId: buyer._id,
        title: "Order Successful",
        message: `Your payment for order #${order._id} (product: ${product.title}) was successful.`,
      });
    }

    const couponCode = `DISCOUNT-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    const newCoupon = new Coupon({
      code: couponCode,
      discount: 10,
      assignedTo: buyer._id,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    await newCoupon.save();

    // ✅ Send Email to the Buyer with Coupon Code
    const subject = "You Received a Discount Coupon!";
    const message = `
  <div style="background-color: #000000; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; border-radius: 10px;">
    <h2 style="color: #ffffff; text-align: center;">🎉 Thank You for Your Purchase!</h2>
    
    <p style="font-size: 16px;">Hi <strong>${buyer.name}</strong>,</p>
    
    <p style="font-size: 16px;">
      We truly appreciate your order. As a thank-you gift, here's an exclusive coupon just for you:
    </p>

    <div style="background-color: #ffffff; color: #000000; padding: 20px; margin: 20px auto; max-width: 300px; border-radius: 8px; text-align: center;">
      <p style="font-size: 14px; margin-bottom: 5px;">Your Coupon Code</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${couponCode}</p>
      <p style="font-size: 12px; color: #555555; margin-top: 10px;">Valid for 3 days only</p>
    </div>

    <p style="font-size: 14px; margin-top: 30px;">
      Use this code at checkout on your next purchase to enjoy a sweet discount!
    </p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #444444;">

    <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
      If you have any questions, just reply to this email — we're here to help!
    </p>
  </div>
`;

    await sendEmail(buyer.email, subject, message);

    // ✅ Remove purchased products from user's cart
    const purchasedProductIds = orders.map((order) => order.product_id);

    await Cart.updateOne(
      { user: buyer._id },
      {
        $pull: {
          items: { product: { $in: purchasedProductIds } },
        },
      }
    );

    // ✅ Also remove purchased products from user's wishlist
    await Wishlist.updateOne(
      { user: buyer._id },
      {
        $pull: {
          products: { $in: purchasedProductIds },
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and coupon issued.",
      data: { orders, coupon: newCoupon },
    });
  } catch (error) {
    console.error("❌ verifyPayment error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
      error: error.message,
    });
  }
};

// Get user orders (for customers)
const getUserOrders = async (req, res) => {
  const customer_id = req.user.userId;

  try {
    const orders = await Order.find({
      customer_id,
      deliveryStatus: { $ne: "cancelled" },
    })
      .populate("product_id")
      .populate("vendor_id")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user.",
      });
    }

    // // 🔐 Get Shiprocket token once
    // const token = await getShiprocketToken();

    // // 🌀 Attach live delivery status
    // const ordersWithLiveStatus = await Promise.all(
    //   orders.map(async (order) => {
    //     let liveStatus = "Not Shipped Yet";

    //     if (order.awb_code) {
    //       liveStatus = await getShiprocketTrackingStatus(order.awb_code, token);
    //     }

    //     return {
    //       ...order._doc,
    //       liveTrackingStatus: liveStatus,
    //     };
    //   })
    // );

    res.status(200).json({
      success: true,
      message: "User orders fetched successfully.",
      // data: ordersWithLiveStatus,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders.",
      error: error.message,
    });
  }
};

// Get seller (vendor) orders
const getSellerOrders = async (req, res) => {
  const vendor_id = req.user.userId; // Assuming vendor is authenticated and userId is attached to req.user

  try {
    // Find orders where the vendor_id matches the logged-in vendor
    const orders = await Order.find({
      vendor_id,
      status: "paid",
      deliveryStatus: { $ne: "cancelled" }, // exclude cancelled deliveries
    })

      .populate("product_id")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this seller.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Seller orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders.",
      error: error.message,
    });
  }
};

// Update order status (by vendor)
const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { deliveryStatus } = req.body;
  const allowedStatuses = ["pending", "shipped", "delivered", "rejected"];

  if (!allowedStatuses.includes(deliveryStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value.",
    });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Ensure only the vendor of the product can update status
    if (order.vendor_id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only update your own orders.",
      });
    }

    // Update order status
    order.deliveryStatus = deliveryStatus;
    await order.save();

    // Mark product as sold if order is delivered
    if (deliveryStatus === "delivered") {
      await Product.findByIdAndUpdate(order.product_id, { soldStatus: true });
    }

    // ✅ Create a notification for the user
    await Notification.create({
      userId: order.user_id, // Notify the buyer
      title: "Order Status Updated",
      message: `Your order #${order._id} status has been updated to '${deliveryStatus}'.`,
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to '${deliveryStatus}'.`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

// Cancel order and process refund (by customer)
const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const customer_id = req.user.userId;

  try {
    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Ensure only the customer who placed the order can cancel it
    if (order.customer_id.toString() !== customer_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only cancel your own orders.",
      });
    }

    // Check if the order is already shipped/delivered
    if (["shipped", "delivered"].includes(order.deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Order cannot be canceled after it has been shipped or delivered.",
      });
    }

    // Cancel in Shiprocket
    if (order.shiprocket_order_id) {
      const token = await getShiprocketToken();
      const cancelResponse = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/cancel",
        { ids: [order.shiprocket_order_id] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Shiprocket cancel response:", cancelResponse.data);

      if (!cancelResponse.data?.status) {
        return res.status(500).json({
          success: false,
          message: "Failed to cancel shipment in Shiprocket.",
          data: cancelResponse.data,
        });
      }
    }

    const refundTxnId = `refund_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`;
    const refundPayload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantUserId: order.customer_id.toString(),
      originalTransactionId: order.phonepe_transaction_id,
      merchantTransactionId: refundTxnId,
      amount: order.amount * 100, // in paise
    };

    const base64Payload = Buffer.from(JSON.stringify(refundPayload)).toString(
      "base64"
    );
    const xVerify =
      crypto
        .createHash("sha256")
        .update(base64Payload + "/pg/v1/refund" + process.env.PHONEPE_SALT_KEY)
        .digest("hex") +
      "###" +
      process.env.PHONEPE_SALT_INDEX;

    const refundResponse = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/refund`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": process.env.PHONEPE_MERCHANT_ID,
        },
      }
    );

    if (!refundResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to process PhonePe refund.",
        phonepeResponse: refundResponse.data,
      });
    }

    await User.findByIdAndUpdate(order.vendor_id, {
      $inc: {
        totalSold: -1,
        balance: -order.amount,
      },
    });

    // Revert product soldStatus to false
    await Product.findByIdAndUpdate(order.product_id, { soldStatus: false });

    // Update order status to canceled
    order.status = "canceled";
    order.deliveryStatus = "cancelled";
    await order.save();

    // ✅ Create notification for the customer (buyer)
    await Notification.create({
      userId: order.customer_id,
      title: "Order Canceled",
      message: `Your order #${order._id} has been successfully canceled and a refund is being processed.`,
    });

    // ✅ Create notification for the vendor (seller)
    await Notification.create({
      userId: order.vendor_id,
      title: "Order Canceled by Customer",
      message: `Order #${order._id} has been canceled by the customer.`,
    });

    res.status(200).json({
      success: true,
      message: "Order canceled and refund processed successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Error canceling order:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order.",
      error: error.message,
    });
  }
};

// Get all addresses of the logged-in user
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming user ID is available from authentication middleware

    // Find all addresses belonging to the user
    const addresses = await Address.find({ userId });

    if (!addresses.length) {
      return res.status(404).json({
        success: false,
        message: "No existing addresses found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User addresses fetched successfully.",
      data: addresses,
    });
  } catch (error) {
    console.error("Error fetching user addresses:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user addresses.",
      error: error.message,
    });
  }
};

const createUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      fullName,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      pickupLocationName,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !phoneNumber ||
      !street ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message:
          "All address fields (fullName, phoneNumber, street, city, state, postalCode, country) are required.",
      });
    }

    // Create new address
    const newAddress = new Address({
      userId,
      fullName,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      pickupLocationName,
    });

    // Save to database
    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully.",
      data: savedAddress,
    });
  } catch (error) {
    console.error("Error creating user address:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add address.",
      error: error.message,
    });
  }
};

const updateUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId; // Authenticated user's ID
    const addressId = req.params.addressId; // Address ID from request params
    const {
      fullName,
      phoneNumber,
      street,
      city,
      state,
      postalCode,
      country,
      pickupLocationName,
    } = req.body;

    // Find the address and ensure it belongs to the user
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or does not belong to the user.",
      });
    }

    // Update fields if provided in request body
    if (fullName) address.fullName = fullName;
    if (phoneNumber) address.phoneNumber = phoneNumber;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;
    if (pickupLocationName !== undefined)
      address.pickupLocationName = pickupLocationName;

    // Save updated address
    const updatedAddress = await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      data: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update address.",
      error: error.message,
    });
  }
};

const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.user.userId; // Authenticated user's ID
    const addressId = req.params.addressId; // Address ID from request params

    // Find and delete the address
    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found or does not belong to the user.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting address:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete address.",
      error: error.message,
    });
  }
};

const getVendorEarnings = async (req, res) => {
  try {
    const vendorId = new mongoose.Types.ObjectId(req.user.userId); // Convert to ObjectId

    // Get current date
    const now = new Date();

    // Get start of the current week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Adjust to Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // Get start of the current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Function to calculate earnings with a date filter
    const calculateEarnings = async (startDate) => {
      const earnings = await Order.aggregate([
        {
          $match: {
            vendor_id: vendorId, // Match vendor
            status: "paid", // Order must be paid
            deliveryStatus: "delivered", // Order must be delivered
            createdAt: { $gte: startDate }, // Filter by date
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $toDouble: "$amount" } }, // Ensure it's a number
          },
        },
      ]);

      console.log(`Orders found from ${startDate}:`, earnings); // Debugging

      return earnings.length > 0 ? earnings[0].totalAmount : 0;
    };

    // Fetch earnings
    const totalEarnings = await calculateEarnings(new Date(0)); // All-time earnings
    const weeklyEarnings = await calculateEarnings(startOfWeek);
    const monthlyEarnings = await calculateEarnings(startOfMonth);

    res.status(200).json({
      success: true,
      message: "Vendor earnings fetched successfully.",
      totalEarnings,
      weeklyEarnings,
      monthlyEarnings,
    });
  } catch (error) {
    console.error("Error fetching vendor earnings:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor earnings.",
      error: error.message,
    });
  }
};

// ===============================
// Create a new return request
// ===============================
const createReturnRequest = async (req, res) => {
  console.log("Return request body:", req.body);

  try {
    const {
      customerName,
      phoneNumber,
      email,
      bankDetails,
      product,
      productDescription,
      sellerName,
      reason,
      requestTo,
      productId,
    } = req.body;

    const userId = req.user?.userId;
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user.",
        data: null,
      });
    }

    // Validate required fields
    if (
      !customerName ||
      !phoneNumber ||
      !email ||
      !bankDetails ||
      !product ||
      !sellerName ||
      !reason ||
      !requestTo
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required including seller ID.",
        data: null,
      });
    }

    // Handle image uploads (up to 5)
    const paymentScreenshots = req.files
      ? req.files.map((file) => file.path)
      : [];

    if (paymentScreenshots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one payment screenshot image.",
        data: null,
      });
    }

    // Create and save the return request
    const newReturnRequest = new ReturnRequest({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      bankDetails: JSON.parse(bankDetails), // Assuming it's a JSON string
      product: product.trim(),
      productDescription: productDescription?.trim() || "",
      sellerName: sellerName.trim(),
      reason: reason.trim(),
      paymentScreenshots,
      status: "Pending",
      requestedBy: userId,
      requestTo: requestTo.trim(),
      productId,
    });

    await newReturnRequest.save();

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      data: newReturnRequest,
    });
  } catch (error) {
    console.error("Error creating return request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
      error: error.message,
    });
  }
};

// ===================================
// Get all return requests for seller
// ===================================
const getReturnRequestsForSeller = async (req, res) => {
  try {
    const sellerId = req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
        data: null,
      });
    }

    const returnRequests = await ReturnRequest.find({ requestTo: sellerId })
      .populate("requestedBy", "name email phoneNumber")
      .populate("productId", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Return requests fetched successfully.",
      data: returnRequests,
    });
  } catch (error) {
    console.error("Error fetching seller return requests:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
      error: error.message,
    });
  }
};

// ===================================
// Get all return requests (Admin only)
// ===================================
const getAllReturnRequestsForAdmin = async (req, res) => {
  try {
    const allReturnRequests = await ReturnRequest.find()
      .populate("requestedBy", "name email phone")
      .populate("requestTo", "name email phone")
      .populate("productId", "title price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All return requests fetched successfully.",
      data: allReturnRequests,
    });
  } catch (error) {
    console.error("Error fetching return requests for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
      error: error.message,
    });
  }
};

const updateReturnRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const updatedRequest = await ReturnRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: "Return request not found.",
      });
    }

    if (status === "Approved") {
      const { productId, requestedBy, requestTo } = updatedRequest;

      // Step 1: Update the related order
      const updatedOrder = await Order.findOneAndUpdate(
        {
          product_id: productId,
          customer_id: requestedBy,
        },
        {
          status: "returned",
          returnDate: new Date(),
        },
        { new: true }
      );

      // Step 2: Get buyer and seller address
      const buyer = await User.findById(requestedBy);
      const seller = await User.findById(requestTo);
      const buyerAddress = await Address.findOne({ userId: requestedBy });
      const sellerAddress = await Address.findOne({ userId: requestTo });
      const product = await Product.findById(productId);

      if (!buyer || !seller || !buyerAddress || !sellerAddress || !product) {
        return res.status(400).json({
          success: false,
          message: "Required details for reverse shipment missing.",
        });
      }

      // Step 3: Get Shiprocket Token
      const shiprocketToken = await getShiprocketToken();

      // Step 4: Create Reverse Shipment
      const reverseOrderResponse = await createReverseShiprocketOrder(
        updatedOrder,
        product,
        buyerAddress,
        sellerAddress,
        buyer,
        shiprocketToken
      );

      // Optionally save tracking info in order
      if (reverseOrderResponse?.shipment_id) {
        updatedOrder.shiprocket_return_id = reverseOrderResponse.order_id;
        updatedOrder.return_tracking_url = reverseOrderResponse.tracking_url;
        updatedOrder.return_awb_code = reverseOrderResponse.awb_code;
        await updatedOrder.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Return request ${
        status === "Approved"
          ? "approved and sent to Shiprocket for return"
          : `marked as ${status}`
      }.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error processing return request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  createUserAddress,
  getUserAddresses,
  updateUserAddress,
  deleteUserAddress,
  getVendorEarnings,
  createReturnRequest,
  getReturnRequestsForSeller,
  getAllReturnRequestsForAdmin,
  updateReturnRequestStatus,
};
