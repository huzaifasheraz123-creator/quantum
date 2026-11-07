const API_BASE = `${window.location.origin}/api/v1`;

const getToken = () => localStorage.getItem('quantumAdminToken');

const setToken = (token) => {
  if (token) {
    localStorage.setItem('quantumAdminToken', token);
  }
};

const redirectIfAuthenticated = () => {
  if (getToken()) {
    window.location.href = 'admin-dashboard.html';
  }
};

const login = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);

  const payload = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    setToken(result.token);
    window.location.href = 'admin-dashboard.html';
  } catch (error) {
    const message = error.message || 'Unable to sign in';
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  redirectIfAuthenticated();

  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', login);
  }
});
