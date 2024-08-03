const nodemailer = require('nodemailer');

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'popeydaniel@hotmail.com',
    subject: 'Test Email from Physical Media Collection App',
    text: 'This is a test email to verify the email service configuration.',
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

