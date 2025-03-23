require('dotenv').config(); 

const nodemailer = require('nodemailer');

console.log("🔍 Email User (in email.js):", process.env.EMAIL_USER);
console.log("🔍 Email Password (in email.js):", process.env.EMAIL_PASSWORD ? "Loaded" : "Not Loaded");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};

module.exports = sendEmail;
