const jwt = require('jsonwebtoken');
const { isTokenRevoked } = require('./tokenRevocation');

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'qutam-travels-secret');
    if (!decoded.jti) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (await isTokenRevoked(decoded.jti)) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    req.adminToken = token;
    req.adminUser = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = requireAdmin;