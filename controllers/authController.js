const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { isTokenRevoked, revokeToken } = require('../middleware/tokenRevocation');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@qutamtravels.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Qutam@123';
const JWT_SECRET = process.env.JWT_SECRET || 'qutam-travels-secret';

const signToken = (user) =>
  jwt.sign(
    {
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (normalizedEmail !== ADMIN_EMAIL.toLowerCase() || String(password) !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = { email: ADMIN_EMAIL, role: 'admin' };
    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.jti) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (await isTokenRevoked(decoded.jti)) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    return res.status(200).json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const logout = async (req, res) => {
  try {
    await revokeToken(req.adminUser.jti, req.adminUser.exp * 1000);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to complete logout' });
  }
};

module.exports = {
  login,
  me,
  logout,
};
