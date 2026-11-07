const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    duration: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: 'Adventure' },
    price: { type: Number, required: true },
    highlights: [{ type: String }],
    image: { type: String, default: 'https://images.unsplash.com/' },
    description: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tour', tourSchema);
