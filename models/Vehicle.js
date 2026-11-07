const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    capacity: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    image: { type: String, default: 'https://images.unsplash.com/' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
