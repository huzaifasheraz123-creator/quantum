const defaultTours = [
  {
    id: '1',
    _id: '1',
    image: 'https://images.unsplash.com/photo-1611821824288-95e977eab064?auto=format&fit=crop&w=1200&q=80',
    badge: 'Featured',
    title: '5 Days Hunza Valley Exploration',
    location: 'Hunza, Gilgit Baltistan',
    duration: '5 Days / 4 Nights',
    price: 'PKR 28,000',
  },
  {
    id: '2',
    _id: '2',
    image: '../assets/images/skardu-basho.jpg.jpg',
    badge: 'Adventure',
    title: '7 Days Skardu & Basho Valley',
    location: 'Skardu, Gilgit Baltistan',
    duration: '7 Days / 6 Nights',
    price: 'PKR 35,000',
  },
  {
    id: '3',
    _id: '3',
    image: 'https://images.unsplash.com/photo-1724142923909-fc4b0c3a2a32?auto=format&fit=crop&w=1200&q=80',
    badge: 'Honeymoon',
    title: '3 Days Swat, Kalam & Malam Jabba Escape',
    location: 'Swat, Kalam & Malam Jabba, KPK',
    duration: '3 Days / 2 Nights',
    price: 'PKR 18,000',
  },
  {
    id: '4',
    _id: '4',
    image: 'https://images.unsplash.com/photo-1668061867899-02b4cfa34747?auto=format&fit=crop&w=1200&q=80',
    badge: 'Family',
    title: '3 Days Naran Kaghan Lake Tour',
    location: 'Naran, Kaghan Valley',
    duration: '3 Days / 2 Nights',
    price: 'PKR 16,000',
  },
  {
    id: '5',
    _id: '5',
    image: 'https://images.unsplash.com/photo-1660754664913-24a235451454?auto=format&fit=crop&w=1200&q=80',
    badge: 'Trekking',
    title: '5 Days Fairy Meadows & Nanga Parbat',
    location: 'Fairy Meadows',
    duration: '5 Days / 4 Nights',
    price: 'PKR 24,000',
  },
  {
    id: '6',
    _id: '6',
    image: 'https://images.unsplash.com/photo-1603491656337-3b491147917c?auto=format&fit=crop&w=1200&q=80',
    badge: 'Cultural',
    title: 'Lahore Walled City Heritage Tour',
    location: 'Lahore, Punjab',
    duration: '1 Day (3-4 Hrs)',
    price: 'PKR 4,500',
  },
];

const API_BASE = `${window.location.origin}/api/v1`;
const state = {
  tours: [...defaultTours],
};

const formatTourPrice = (value) => {
  if (typeof value === 'number') {
    return `PKR ${value.toLocaleString()}`;
  }
  return value || 'PKR 0';
};

const normalizeTour = (tour) => {
  const id = String(tour._id || tour.id || Math.random().toString(16).slice(2));
  const fallbackTour = defaultTours.find((candidate) =>
    candidate.id === id ||
    candidate.title.toLowerCase() === String(tour.title || '').toLowerCase() ||
    candidate.location.toLowerCase() === String(tour.location || '').toLowerCase()
  );

  return {
    id,
    _id: String(tour._id || tour.id || id),
    image: fallbackTour?.image || tour.image || defaultTours[0].image,
    badge: tour.category || tour.badge || 'Featured',
    title: fallbackTour?.title || tour.title || 'Quantum Tour',
    location: fallbackTour?.location || tour.location || 'Pakistan',
    duration: tour.duration || 'Custom itinerary',
    price: formatTourPrice(tour.price),
  };
};

const showMessage = (message, type = 'success') => {
  const existing = document.querySelector('.toast-message');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
};

const fetchTours = async () => {
  try {
    const res = await fetch(`${API_BASE}/tours`);
    if (!res.ok) throw new Error('Failed to fetch tours');

    const payload = await res.json();
    if (payload && Array.isArray(payload.data) && payload.data.length) {
      return payload.data.map(normalizeTour);
    }
  } catch (error) {
    console.warn('Using demo tours because the API is unavailable:', error.message);
  }

  return [...defaultTours];
};

const createTourCard = (tour) => `
  <article class="card-item">
    <div class="card-image" style="background-image:url('${tour.image}')"></div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-badge">${tour.badge}</span>
        <span>${tour.duration}</span>
      </div>
      <h3>${tour.title}</h3>
      <p>${tour.location}</p>
      <div class="card-price-row">
        <span class="price">${tour.price}</span>
        <a class="btn btn-primary" href="tour-detail-01.html?id=${tour.id}">View Details</a>
      </div>
    </div>
  </article>
`;

const renderFeaturedTours = () => {
  const target = document.getElementById('featuredTours');
  if (!target) return;
  target.innerHTML = state.tours.slice(0, 6).map(createTourCard).join('');
};

const getMatchingTours = (params) => {
  const destination = params.get('destination') || '';
  const query = [params.get('query') || '', destination.replace(/-/g, ' ')].join(' ').trim().toLowerCase();
  const terms = query.split(/\s+/).filter(Boolean);
  const duration = (params.get('duration') || '').toLowerCase();
  const category = (params.get('category') || '').toLowerCase();
  return state.tours.filter((tour) => {
    const searchableText = `${tour.title} ${tour.location} ${tour.badge} ${tour.duration}`.toLowerCase();
    const matchesQuery = terms.every((term) => searchableText.includes(term));
    const matchesDuration = !duration || tour.duration.toLowerCase().startsWith(duration);
    const matchesCategory = !category || tour.badge.toLowerCase() === category;

    return matchesQuery && matchesDuration && matchesCategory;
  });
};

const getTourDetailUrl = (tour) => `tour-detail-01.html?id=${encodeURIComponent(tour.id)}`;

const renderTourGrid = () => {
  const target = document.getElementById('tourGrid');
  if (!target) return;

  const filteredTours = getMatchingTours(new URLSearchParams(window.location.search));

  target.innerHTML = filteredTours.length
    ? filteredTours.map(createTourCard).join('')
    : '<p class="empty-state">No tours are currently listed for this destination.</p>';
};

const findTours = (query) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return state.tours.filter((tour) => {
    const searchableText = `${tour.title} ${tour.location} ${tour.badge} ${tour.duration}`.toLowerCase();
    return terms.every((term) => searchableText.includes(term));
  });
};

const bindSearchSelects = (form) => {
  form.querySelectorAll('[data-search-select]').forEach((wrapper) => {
    const trigger = wrapper.querySelector('[data-select-trigger]');
    const valueInput = wrapper.querySelector('input[type="hidden"]');
    const valueLabel = wrapper.querySelector('[data-select-value]');
    const menu = wrapper.querySelector('.search-select-menu');
    const options = [...wrapper.querySelectorAll('[role="option"]')];

    const setOpen = (open, focusIndex = null) => {
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open && focusIndex !== null) options[focusIndex]?.focus();
    };

    const selectOption = (option) => {
      valueInput.value = option.dataset.value;
      valueLabel.textContent = option.querySelector('strong').textContent;
      options.forEach((item) => {
        item.setAttribute('aria-selected', String(item === option));
      });
      setOpen(false);
      trigger.focus();
    };

    trigger.addEventListener('click', () => setOpen(menu.hidden));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true, event.key === 'ArrowDown' ? 0 : options.length - 1);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    });

    options.forEach((option, index) => {
      option.addEventListener('click', () => selectOption(option));
      option.addEventListener('keydown', (event) => {
        let nextIndex = index;
        if (event.key === 'ArrowDown') nextIndex = Math.min(index + 1, options.length - 1);
        else if (event.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = options.length - 1;
        else if (event.key === 'Escape') {
          event.preventDefault();
          setOpen(false);
          trigger.focus();
          return;
        } else {
          return;
        }

        event.preventDefault();
        options[nextIndex].focus();
      });
    });

    wrapper.addEventListener('focusout', (event) => {
      if (!wrapper.contains(event.relatedTarget)) setOpen(false);
    });

    document.addEventListener('pointerdown', (event) => {
      if (!wrapper.contains(event.target)) setOpen(false);
    });
  });
};

const bindTourSearch = () => {
  const dialog = document.getElementById('headerSearchDialog');
  const toggle = document.querySelector('[data-search-toggle]');
  const closeButton = document.querySelector('[data-search-close]');
  const searchForm = document.getElementById('headerSearchForm');
  const searchInput = document.getElementById('headerSearchInput');
  const results = document.getElementById('headerSearchResults');
  const tourSearchForm = document.getElementById('tourSearchForm');

  if (tourSearchForm) {
    bindSearchSelects(tourSearchForm);
    tourSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const params = new URLSearchParams(new FormData(tourSearchForm));
      const matches = getMatchingTours(params);
      if (matches.length === 1) {
        window.location.assign(getTourDetailUrl(matches[0]));
        return;
      }

      const query = params.toString();
      window.location.assign(`tour-grid-01.html${query ? `?${query}` : ''}`);
    });
  }

  if (!dialog || !toggle || !closeButton || !searchForm || !searchInput || !results) return;

  const renderResults = (query) => {
    results.replaceChildren();
    const matches = findTours(query);

    if (!query.trim()) {
      const hint = document.createElement('p');
      hint.className = 'search-empty-state';
      hint.textContent = 'Start typing to discover tours by destination, name, or travel style.';
      results.appendChild(hint);
      return matches;
    }

    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty-state';
      empty.textContent = 'No matching tours yet. Try Hunza, Skardu, Swat, or a travel style.';
      results.appendChild(empty);
      return matches;
    }

    matches.slice(0, 6).forEach((tour) => {
      const link = document.createElement('a');
      const copy = document.createElement('span');
      const title = document.createElement('strong');
      const details = document.createElement('small');
      const arrow = document.createElement('span');

      link.className = 'search-result';
      link.href = getTourDetailUrl(tour);
      title.textContent = tour.title;
      details.textContent = `${tour.location} · ${tour.duration} · ${tour.price}`;
      arrow.className = 'search-result-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      copy.className = 'search-result-copy';
      copy.append(title, details);
      link.append(copy, arrow);
      results.appendChild(link);
    });

    return matches;
  };

  toggle.addEventListener('click', () => {
    dialog.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    searchInput.focus();
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  searchInput.addEventListener('input', () => renderResults(searchInput.value));
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    const matches = renderResults(query);

    if (matches.length === 1) {
      window.location.assign(getTourDetailUrl(matches[0]));
    } else if (matches.length > 1) {
      window.location.assign(`tour-grid-01.html?query=${encodeURIComponent(query)}`);
    }
  });
};

const renderTourDetail = () => {
  const detailNode = document.getElementById('tourDetail');
  if (!detailNode) return;

  const params = new URLSearchParams(window.location.search);
  const selectedId = params.get('id') || state.tours[0].id;
  const tour = state.tours.find((item) => item.id === selectedId) || state.tours[0];

  detailNode.innerHTML = `
    <div class="detail-grid">
      <article class="detail-card">
        <div class="detail-image" style="background-image:url('${tour.image}')"></div>
        <div class="detail-content">
          <span class="eyebrow">${tour.badge}</span>
          <h2>${tour.title}</h2>
          <p><strong>Location:</strong> ${tour.location}</p>
          <p><strong>Duration:</strong> ${tour.duration}</p>
          <p><strong>Starting from:</strong> <span class="price">${tour.price}</span></p>
          <p>Enjoy a remarkable journey through scenic highlights, culturally rich stops, and unforgettable landscapes designed for comfort, adventure, and ease.</p>
          <ul>
            <li>Curated sightseeing routes and local guidance</li>
            <li>Comfortable transport and flexible booking</li>
            <li>Dedicated travel support throughout your trip</li>
          </ul>
        </div>
      </article>

      <aside class="booking-card">
        <h3>Book this tour</h3>
        <form class="booking-form" id="bookingForm">
          <input type="hidden" name="tourId" value="${tour.id}" />
          <label>
            Full Name
            <input type="text" name="customerName" placeholder="Your name" required />
          </label>
          <label>
            Phone Number
            <input type="tel" name="phone" placeholder="03xx-xxxxxxx" required />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="your@email.com" required />
          </label>
          <label>
            Departure Date
            <input type="date" name="departureDate" required />
          </label>
          <label>
            Passengers
            <select name="passengersCount">
              <option value="2">2 Adults</option>
              <option value="4">4 Adults</option>
              <option value="6">6 Adults</option>
            </select>
          </label>
          <button type="submit" class="btn btn-primary">Submit Booking</button>
        </form>
      </aside>
    </div>
  `;

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', submitBooking);
  }
};

const submitBooking = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = {
    customerName: formData.get('customerName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    departureDate: formData.get('departureDate'),
    passengersCount: Number(formData.get('passengersCount') || 2),
    tourId: formData.get('tourId') || 'demo-tour',
    specialRequests: 'Tour booking request from website',
  };

  try {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Booking failed');
    }

    showMessage('Booking request sent successfully.');
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage('Booking request could not be sent. Please contact us directly.', 'error');
  }
};

const submitContact = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  };

  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Contact form failed');
    }

    showMessage('Your inquiry was sent successfully.');
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage('Your inquiry could not be sent right now. Please call us directly.', 'error');
  }
};

const bindForms = () => {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', submitContact);
  }
};

const bindVehicleDetails = () => {
  const dialog = document.getElementById('vehicleDialog');
  if (!dialog) return;

  const title = dialog.querySelector('[data-vehicle-detail-title]');
  const capacity = dialog.querySelector('[data-vehicle-detail-capacity]');
  const price = dialog.querySelector('[data-vehicle-detail-price]');

  document.querySelectorAll('[data-vehicle-details]').forEach((button) => {
    button.addEventListener('click', () => {
      title.textContent = button.dataset.vehicleTitle;
      capacity.textContent = button.dataset.vehicleCapacity;
      price.textContent = button.dataset.vehiclePrice;
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-close-vehicle-dialog]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  state.tours = await fetchTours();
  renderFeaturedTours();
  renderTourGrid();
  renderTourDetail();
  bindForms();
  bindTourSearch();
  bindVehicleDetails();
});
