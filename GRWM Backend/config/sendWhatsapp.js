const twilio = require("twilio");

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Use environment variable for security
const authToken = process.env.TWILIO_AUTH_TOKEN; // Use environment variable for security

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (phone, message) => {
  try {
    // Format phone number with the country code (e.g., +91 for India)
    const formattedPhone = `+91${phone.replace(/^0+/, "")}`; // Remove leading zero and add +91

    const from = "whatsapp:+14155238886"; // This is Twilio's sandbox number for WhatsApp
    const to = `whatsapp:${formattedPhone}`; // User's phone number, prefixed with 'whatsapp:'

    // Send the WhatsApp message using Twilio's API
    const messageResponse = await client.messages.create({
      body: message,
      from: from,
      to: to,
    });

    console.log("WhatsApp message sent:", messageResponse.sid);
    return messageResponse;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error; // Re-throw the error if you need to handle it later
  }
};

module.exports = sendWhatsAppMessage;
