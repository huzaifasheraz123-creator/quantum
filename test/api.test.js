const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');

process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-password';
process.env.JWT_SECRET = 'test-only-secret';

const { app } = require('../server');

let server;
let apiBase;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  apiBase = `http://127.0.0.1:${server.address().port}/api/v1`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const login = async () => {
  const response = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  assert.equal(response.status, 200);
  return response.json();
};

test('bookings require admin authentication and logout revokes the token', async () => {
  const anonymousBookings = await fetch(`${apiBase}/bookings`);
  assert.equal(anonymousBookings.status, 401);

  const firstLogin = await login();
  const authorization = { Authorization: `Bearer ${firstLogin.token}` };
  const bookings = await fetch(`${apiBase}/bookings`, { headers: authorization });
  assert.equal(bookings.status, 200);

  const logout = await fetch(`${apiBase}/auth/logout`, { method: 'POST', headers: authorization });
  assert.equal(logout.status, 200);

  const revokedMe = await fetch(`${apiBase}/auth/me`, { headers: authorization });
  assert.equal(revokedMe.status, 401);

  const revokedBookings = await fetch(`${apiBase}/bookings`, { headers: authorization });
  assert.equal(revokedBookings.status, 401);

  const secondLogin = await login();
  assert.notEqual(secondLogin.token, firstLogin.token);
  const validMe = await fetch(`${apiBase}/auth/me`, {
    headers: { Authorization: `Bearer ${secondLogin.token}` },
  });
  assert.equal(validMe.status, 200);
});

test('API serves the public homepage on the same origin', async () => {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/pages/homepage-5.html`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
});