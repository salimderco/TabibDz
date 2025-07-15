require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://127.0.0.1:5174'], // تحديث المنفذ ليتطابق مع Vite
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());

// MongoDB connection options
const mongooseOptions = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4 // Use IPv4, skip trying IPv6
};

// MongoDB connection with retry logic
const connectWithRetry = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabibdz';
  
  try {
    await mongoose.connect(mongoURI, mongooseOptions);
    console.log('🌿 Connected to MongoDB successfully');
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      setTimeout(connectWithRetry, 5000);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected! Attempting to reconnect...');
      setTimeout(connectWithRetry, 5000);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    // Retry connection after 5 seconds
    setTimeout(connectWithRetry, 5000);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Duplicate Error',
      message: 'A record with this information already exists.'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong on the server!'
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Start server with proper error handling
const PORT = process.env.PORT || 3001;
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectWithRetry();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer(); 