const mongoose = require('mongoose');
const Booking = require('../models/Booking');

const sampleBookings = [
  {
    _id: '1',
    customerName: 'Ayesha Khan',
    email: 'ayesha@gmail.com',
    phone: '03001234567',
    departureDate: '2026-11-12',
    passengersCount: 2,
    tourId: '1',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    customerName: 'Ali Hassan',
    email: 'ali@gmail.com',
    phone: '03211234567',
    departureDate: '2026-11-20',
    passengersCount: 4,
    tourId: '2',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

const createBooking = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const booking = {
        _id: String(Date.now()),
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      sampleBookings.unshift(booking);
      return res.status(201).json({
        success: true,
        message: 'Booking request received successfully',
        data: booking,
      });
    }

    const booking = await Booking.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Booking request received successfully',
      data: booking,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: sampleBookings.length, data: sampleBookings });
    }

    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
};
