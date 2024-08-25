const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');


const currentEnv = process.env.NODE_ENV || 'development';
dotenv.config({
  path: `.env.${currentEnv}`
});


const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
const emailTestRoute = require('./routes/emailTest');

// Debugging: Log environment variables
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/collection', collectionRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Email testing
app.use('/api', emailTestRoute);
