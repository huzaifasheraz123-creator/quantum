const API_BASE = `${window.location.origin}/api/v1`;
const getAuthToken = () => localStorage.getItem('quantumAdminToken');

const demoTours = [
  {
    _id: '1',
    title: '5 Days Hunza Valley Exploration',
    category: 'Family',
    location: 'Hunza, Gilgit Baltistan',
    duration: '5 Days / 4 Nights',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Karimabad', 'Attabad Lake', 'Passu Cones'],
  },
  {
    _id: '2',
    title: '7 Days Skardu & Basho Valley',
    category: 'Adventure',
    location: 'Skardu, Gilgit Baltistan',
    duration: '7 Days / 6 Nights',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    highlights: ['Shangrila Resort', 'Upper Kachura Lake', 'Deosai'],
  },
];

const demoBookings = [
  {
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

const state = {
  tours: [...demoTours],
  bookings: [...demoBookings],
};

const toCurrency = (value) => `PKR ${Number(value || 0).toLocaleString()}`;

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const showNotice = (message, type = 'success') => {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
};

const fetchJson = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

const loadDashboard = async () => {
  try {
    const [tourResponse, bookingResponse] = await Promise.all([
      fetchJson(`${API_BASE}/tours`),
      fetchJson(`${API_BASE}/bookings`),
    ]);

    state.tours = Array.isArray(tourResponse.data) && tourResponse.data.length ? tourResponse.data : demoTours;
    state.bookings = Array.isArray(bookingResponse.data) && bookingResponse.data.length ? bookingResponse.data : demoBookings;
  } catch (error) {
    console.warn('Using demo data because the API is unavailable:', error.message);
    state.tours = demoTours;
    state.bookings = demoBookings;
  }

  renderStats();
  renderBookings();
  renderTours();
};

const renderStats = () => {
  const totalTours = state.tours.length;
  const totalBookings = state.bookings.length;
  const pendingBookings = state.bookings.filter((booking) => (booking.status || 'pending').toLowerCase() === 'pending').length;
  const totalRevenue = state.tours.reduce((sum, tour) => sum + Number(tour.price || 0), 0);

  document.getElementById('totalTours').textContent = String(totalTours);
  document.getElementById('totalBookings').textContent = String(totalBookings);
  document.getElementById('pendingBookings').textContent = String(pendingBookings);
  document.getElementById('totalRevenue').textContent = toCurrency(totalRevenue);
};

const renderBookings = () => {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.bookings.slice(0, 6).map((booking) => {
    const tourTitle = state.tours.find((tour) => String(tour._id || tour.id) === String(booking.tourId))?.title || 'Custom Request';
    const status = (booking.status || 'pending').toLowerCase();

    return `
      <tr>
        <td>${booking.customerName || 'Unknown'}</td>
        <td>${tourTitle}</td>
        <td>${booking.departureDate || booking.createdAt || 'Not set'}</td>
        <td><span class="status-pill">${status}</span></td>
      </tr>
    `;
  }).join('');
};

const renderTours = () => {
  const tbody = document.getElementById('tourTableBody');
  if (!tbody) return;

  tbody.innerHTML = state.tours.map((tour) => `
    <tr>
      <td>${tour.title}</td>
      <td>${tour.category || 'Adventure'}</td>
      <td>${tour.location}</td>
      <td>${tour.duration}</td>
      <td>${toCurrency(tour.price)}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn btn-secondary" data-action="edit" data-tour-id="${tour._id || tour.id}">Edit</button>
          <button type="button" class="btn btn-primary" data-action="delete" data-tour-id="${tour._id || tour.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('[data-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => handleEditTour(button.dataset.tourId));
  });

  document.querySelectorAll('[data-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => handleDeleteTour(button.dataset.tourId));
  });
};

const resetTourForm = () => {
  const form = document.getElementById('tourForm');
  if (!form) return;

  form.reset();
  form.querySelector('input[name="tourId"]').value = '';
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Create Tour';

  const cancelButton = document.getElementById('cancelEditTour');
  if (cancelButton) cancelButton.classList.add('hidden');
};

const populateTourForm = (tour) => {
  const form = document.getElementById('tourForm');
  if (!form) return;

  form.querySelector('input[name="tourId"]').value = tour._id || tour.id;
  form.querySelector('input[name="title"]').value = tour.title || '';
  form.querySelector('select[name="category"]').value = tour.category || 'Adventure';
  form.querySelector('input[name="duration"]').value = tour.duration || '';
  form.querySelector('input[name="price"]').value = tour.price || 0;
  form.querySelector('input[name="location"]').value = tour.location || '';
  form.querySelector('input[name="image"]').value = tour.image || '';
  form.querySelector('textarea[name="highlights"]').value = Array.isArray(tour.highlights) ? tour.highlights.join(', ') : '';

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Update Tour';

  const cancelButton = document.getElementById('cancelEditTour');
  if (cancelButton) cancelButton.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleEditTour = (tourId) => {
  const tour = state.tours.find((item) => String(item._id || item.id) === String(tourId));
  if (!tour) return;
  populateTourForm(tour);
};

const handleDeleteTour = async (tourId) => {
  if (!window.confirm('Are you sure you want to delete this package?')) return;

  try {
    await fetchJson(`${API_BASE}/tours/${tourId}`, { method: 'DELETE' });
    state.tours = state.tours.filter((tour) => String(tour._id || tour.id) !== String(tourId));
    renderStats();
    renderTours();
    showNotice('Tour deleted successfully.');

    const form = document.getElementById('tourForm');
    if (form && form.querySelector('input[name="tourId"]').value === String(tourId)) {
      resetTourForm();
    }
  } catch (error) {
    console.error(error);
    showNotice('Unable to delete tour.', 'error');
  }
};

const handleTourSubmit = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const tourId = data.get('tourId');

  const payload = {
    title: data.get('title'),
    duration: data.get('duration'),
    location: data.get('location'),
    category: data.get('category'),
    price: Number(data.get('price') || 0),
    image: data.get('image') || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    highlights: (data.get('highlights') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    slug: slugify(data.get('title') || 'new-tour'),
  };

  try {
    const response = tourId
      ? await fetchJson(`${API_BASE}/tours/${tourId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetchJson(`${API_BASE}/tours`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

    const updatedTour = response?.data || response;
    if (tourId) {
      state.tours = state.tours.map((item) => (String(item._id || item.id) === String(tourId) ? { ...item, ...updatedTour } : item));
      showNotice('Tour updated successfully.');
    } else {
      state.tours.unshift(updatedTour);
      showNotice('Tour created successfully.');
    }

    renderStats();
    renderTours();
    resetTourForm();
  } catch (error) {
    console.error(error);
    showNotice(tourId ? 'Unable to update tour. Please try again.' : 'Unable to create tour. Please try again.', 'error');
  }
};

const requireAuth = async () => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  try {
    const response = await fetchJson(`${API_BASE}/auth/me`);
    if (!response?.success) {
      localStorage.removeItem('quantumAdminToken');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  } catch (error) {
    localStorage.removeItem('quantumAdminToken');
    window.location.href = 'login.html';
    return false;
  }
};

const bindSignOut = () => {
  const button = document.getElementById('signOutButton');
  if (!button) return;

  button.addEventListener('click', async () => {
    button.disabled = true;

    try {
      await fetchJson(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.warn('Server logout could not be confirmed:', error.message);
    } finally {
      localStorage.removeItem('quantumAdminToken');
      window.location.replace('login.html');
    }
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  const isAuthorized = await requireAuth();
  if (!isAuthorized) return;

  loadDashboard();
  bindSignOut();

  const tourForm = document.getElementById('tourForm');
  if (tourForm) {
    tourForm.addEventListener('submit', handleTourSubmit);
  }

  const cancelButton = document.getElementById('cancelEditTour');
  if (cancelButton) {
    cancelButton.addEventListener('click', resetTourForm);
  }
});
