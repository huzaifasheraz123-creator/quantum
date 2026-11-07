const mongoose = require('mongoose');
const Tour = require('../models/Tour');

const sampleTours = [
  {
    _id: '1',
    title: '5 Days Hunza Valley Exploration',
    slug: '5-days-hunza-valley-exploration',
    duration: '5 Days / 4 Nights',
    location: 'Hunza, Gilgit Baltistan',
    category: 'Family',
    price: 28000,
    highlights: ['Karimabad', 'Attabad Lake', 'Passu Cones', 'Khunjerab Pass'],
    isFeatured: true,
    active: true,
  },
  {
    _id: '2',
    title: '7 Days Skardu & Basho Valley',
    slug: '7-days-skardu-basho-valley',
    duration: '7 Days / 6 Nights',
    location: 'Skardu, Gilgit Baltistan',
    category: 'Adventure',
    price: 35000,
    highlights: ['Shangrila Resort', 'Upper Kachura Lake', 'Cold Desert', 'Deosai'],
    isFeatured: true,
    active: true,
  },
  {
    _id: '3',
    title: '3 Days Swat, Kalam & Malam Jabba Escape',
    slug: '3-days-swat-kalam-scenic-escape',
    duration: '3 Days / 2 Nights',
    location: 'Swat, Kalam & Malam Jabba, KPK',
    category: 'Honeymoon',
    price: 18000,
    highlights: ['White Palace', 'Mingora', 'Ushu Forest', 'Mahodand Lake'],
    isFeatured: true,
    active: true,
  },
  {
    _id: '4',
    title: '3 Days Naran Kaghan Lake Tour',
    slug: '3-days-naran-kaghan-lake-tour',
    duration: '3 Days / 2 Nights',
    location: 'Naran, Kaghan Valley',
    category: 'Family',
    price: 16000,
    highlights: ['Balakot', 'Kiwai', 'Saif-ul-Malook Lake', 'Babusar Top'],
    isFeatured: true,
    active: true,
  },
  {
    _id: '5',
    title: '5 Days Fairy Meadows & Nanga Parbat',
    slug: '5-days-fairy-meadows-nanga-parbat',
    duration: '5 Days / 4 Nights',
    location: 'Fairy Meadows',
    category: 'Trekking',
    price: 24000,
    highlights: ['Trekking', 'Raikot Bridge', 'Nanga Parbat View Point'],
    isFeatured: true,
    active: true,
  },
  {
    _id: '6',
    title: 'Lahore Walled City Heritage Tour',
    slug: 'lahore-walled-city-heritage-tour',
    duration: '1 Day (3-4 Hrs)',
    location: 'Lahore, Punjab',
    category: 'Cultural',
    price: 4500,
    highlights: ['Badshahi Mosque', 'Lahore Fort', 'Delhi Gate', 'Shahi Hammam'],
    isFeatured: false,
    active: true,
  },
];

const getTours = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: sampleTours.length, data: sampleTours });
    }

    const tours = await Tour.find({ active: true }).sort({ createdAt: -1 });

    if (tours.length > 0) {
      return res.status(200).json({ success: true, count: tours.length, data: tours });
    }

    return res.status(200).json({ success: true, count: sampleTours.length, data: sampleTours });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (tour) {
      return res.status(200).json({ success: true, data: tour });
    }

    const fallbackTour = sampleTours.find((item) => item._id === req.params.id);

    if (fallbackTour) {
      return res.status(200).json({ success: true, data: fallbackTour });
    }

    return res.status(404).json({ success: false, message: 'Tour not found' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTour = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newTour = {
        _id: String(Date.now()),
        ...req.body,
        slug: req.body.slug || `${(req.body.title || 'new-tour').toLowerCase().replace(/\s+/g, '-')}`,
        active: true,
      };

      sampleTours.unshift(newTour);
      return res.status(201).json({ success: true, data: newTour });
    }

    const tour = await Tour.create(req.body);
    return res.status(201).json({ success: true, data: tour });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateTour = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = sampleTours.findIndex((item) => String(item._id) === String(req.params.id));

      if (index < 0) {
        return res.status(404).json({ success: false, message: 'Tour not found' });
      }

      sampleTours[index] = {
        ...sampleTours[index],
        ...req.body,
        _id: String(req.params.id),
        slug: req.body.slug || sampleTours[index].slug,
      };

      return res.status(200).json({ success: true, data: sampleTours[index] });
    }

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    return res.status(200).json({ success: true, data: tour });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteTour = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const index = sampleTours.findIndex((item) => String(item._id) === String(req.params.id));

      if (index < 0) {
        return res.status(404).json({ success: false, message: 'Tour not found' });
      }

      sampleTours.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Tour deleted successfully' });
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    return res.status(200).json({ success: true, message: 'Tour deleted successfully' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
};
