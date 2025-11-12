const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config(); // Load .env variables

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendTestEmail() {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "youremail@gmail.com", // Replace with your personal email
      subject: "Smart Property System - Test Email",
      text: "✅ Your Gmail App Password is working fine!",
    });

    console.log("📧 Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
  }
}

sendTestEmail();
