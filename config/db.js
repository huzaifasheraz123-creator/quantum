const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qutam-travels';

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn('MongoDB not available. Continuing in demo mode without database persistence.');
    return false;
  }
};

module.exports = connectDB;
