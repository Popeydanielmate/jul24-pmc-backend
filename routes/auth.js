const express = require('express');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const sendEmail = require('../utils/emailService');
const auth = require('../middleware/auth'); 
const path = require('path');
const router = express.Router();

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

      user = new User({
        username,
        email,
        password, 
        isVerified: true, 
      });

      await user.save();

      console.log('User saved:', user); 

      const htmlContent = `
        <p>Welcome to Physical Media Cataloging, ${username}!</p>
        <img src="cid:vhs" alt="Welcome Image" style="width:300px;height:auto;" />
        <p>Now you're ready to log in and add to your collection!</p>
      `;

      const imagePath = path.join(__dirname, '../assets/vhs.jpg');
      await sendEmail(email, 'Welcome to Physical Media Cataloging', "", htmlContent, [
        {
          filename: 'vhs.jpg',
          path: imagePath,
          cid: 'vhs'
        }
      ]);

      res.status(201).json({ message: 'User registered successfully. A welcome email has been sent.' });
    } catch (err) {
      console.error('Server error:', err.message);
      res.status(500).send('Server error');
    }
  }
);



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
        console.log('Validation errors:', errors.array()); 
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
      console.log('Password received from frontend:', password); 
  
      try {
        let user = await User.findOne({ email });
        console.log('User found:', user); 
        if (!user) {
          console.log('User not found for email:', email); 
          return res.status(400).json({ message: 'Invalid credentials' });
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Comparing passwords:', password, user.password); 
        console.log('Password match:', isMatch); 
        if (!isMatch) {
          console.log('Password mismatch for user:', user.email); 
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
            console.log('Token generated:', token); 
            res.json({ token });
          }
        );
      } catch (err) {
        console.error('Server error:', err.message); 
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
    res.status500().send('Server error');
  }
});

module.exports = router;

