const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    });

    const mailOptions = {
      from: `"GRWM" <${process.env.MAIL_USER}>`,
      to: to,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
