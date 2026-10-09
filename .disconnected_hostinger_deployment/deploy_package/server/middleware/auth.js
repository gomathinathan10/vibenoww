import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'vibenoww_production_jwt_secret_key_2026';

export function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    const role = (req.user && req.user.role) ? req.user.role.toUpperCase() : '';
    if (role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
  });
}

export default {
  authenticateToken,
  requireAdmin
};
