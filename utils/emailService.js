const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = (to, subject, text, html, attachments = []) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text, 
    html: html,
    attachments: attachments, 
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent:', info.response);
    })
    .catch(error => {
      console.error('Error sending email:', error);
    });
};

module.exports = sendEmail;

