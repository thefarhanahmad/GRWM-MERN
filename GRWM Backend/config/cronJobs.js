const cron = require("node-cron");
const sendWhatsAppMessage = require("./sendWhatsapp");
const Cart = require("../models/Cart");
const User = require("../models/User");
const BoostProduct = require("../models/BoostProduct");
const CategoryData = require("../models/CategoryData");

// Cart Reminder Cron Job (Runs every day at midnight)
cron.schedule("* * * * *", async () => {
  console.log("⏰ Running combined daily cron job...");

  // ------------------------- 🛒 Cart Reminder -------------------------

  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // 3 days ago

    // Find all carts where 'addedToCartAt' is older than 3 days
    const carts = await Cart.find({
      "items.addedToCartAt": { $lt: threeDaysAgo },
    }).populate("user");

    for (const cart of carts) {
      const user = cart.user;

      // Validate phone number
      if (!user.phone || !/^\d{10}$/.test(user.phone)) {
        // Log if phone number is missing or invalid
        console.log(
          `Skipping user ${user.name} (${user._id}) due to invalid or missing phone number`
        );
        continue; // Skip this user
      }

      const message = `✨ Hi ${user.name}! We saved your cart just for you 🛒

Your selected items are still waiting ❤️

👉 Tap here to view & complete your order: https://gwrm.netlify.app/cart

⚡ Hurry! They might sell out soon. Treat yourself today 🌟`;

      try {
        // Send WhatsApp reminder
        await sendWhatsAppMessage(user.phone, message);
        console.log(`Sent reminder to ${user.name} (${user.phone})`);
      } catch (error) {
        // Log error if sending the message fails
        console.error(
          `Failed to send message to ${user.name} (${user.phone}):`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error in Cart Reminder Cron Job:", error);
  }

  // ------------------------- 🚀 Boost Product Expiration Cleanup -------------------------
  try {
    const now = new Date();

    const expiredBoosts = await BoostProduct.find({ endDate: { $lt: now } });

    for (const boost of expiredBoosts) {
      const productIds = boost.products;

      // Remove product IDs from CategoryData
      await CategoryData.updateMany(
        { products: { $in: productIds } },
        { $pull: { products: { $in: productIds } } }
      );

      // Delete the BoostProduct entry
      await BoostProduct.deleteOne({ _id: boost._id });

      console.log(`🧹 Cleaned expired boost for user ${boost.userId}`);
    }

    console.log("✅ Expired boost cleanup job finished");
  } catch (error) {
    console.error("❌ Error during Boost Product cleanup:", error);
  }

  console.log("✅ Combined cron job finished");
});

module.exports = cron;
