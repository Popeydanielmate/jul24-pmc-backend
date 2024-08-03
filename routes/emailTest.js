const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/emailService');

router.get('/send-test-email', async (req, res) => {
  try {
    await sendEmail('test@example.com', 'Test Email', 'This is a test email from Physical Media Collectors.');
    res.status(200).json({ message: 'Test email sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send test email.', error });
  }
});

module.exports = router;
