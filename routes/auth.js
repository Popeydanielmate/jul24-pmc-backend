const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const CollectionItem = require('../models/collectionItem');
const sendEmail = require('../utils/emailService'); 
const auth = require('../middleware/auth');

const router = express.Router();

// Register user
router.post(
    '/register',
    [
      check('username', 'Username is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { username, email, password } = req.body;
  
      try {
        let user = await User.findOne({ email });
  
        if (user) {
          return res.status(400).json({ message: 'User already exists' });
        }
  
        user = new User({ username, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        
        // Generate verification token
        const verificationToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Verification token generated:', verificationToken);

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await sendEmail(email, 'Verify Your Email', `Please verify your email by clicking the following link: ${verificationUrl}`, `<p>Please verify your email by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`);

        
  
        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
      } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).send('Server error');
      }
    }
  );
  
  
 // Verify email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    console.log('Verification endpoint hit with token:', token);
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      const user = await User.findById(decoded.userId);
      console.log('User:', user);
  
      if (!user) {
        console.log('User not found for token:', token); 
        return res.status(400).json({ message: 'Invalid token' });
      }
  
      user.isVerified = true;
      await user.save();
  
      console.log('Email verified for user:', user.email); 
      res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
      console.error('Email verification error:', err.message);
      res.status(500).send({ message: 'Server error' });
    }
  });
  
  
  
  


// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// Delete user account
router.delete('/', auth, async (req, res) => {
    try {
      const userId = req.user.id;
  
      
      await CollectionItem.deleteMany({ userId });
  
      
      await User.findByIdAndDelete(userId); 
  
      res.json({ message: 'User and all associated collection items deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  // Request password reset
router.post('/request-reset-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
  
      res.json({ message: 'Password reset email sent' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
  // Reset password
  router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
      }
  
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
  
      res.json({ message: 'Password has been reset' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  
module.exports = router;


