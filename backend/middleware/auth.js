const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware untuk verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token dari header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Tidak ada token. Silakan login terlebih dahulu.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user dari database
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda tidak aktif. Silakan hubungi administrator.'
      });
    }

    // Attach user ke request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah expired. Silakan login kembali.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error pada authentication.'
    });
  }
};

// Middleware untuk check role admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang bisa mengakses.'
    });
  }
  next();
};

// Middleware untuk check ownership (user hanya bisa akses data sendiri)
const authorizeOwner = (resourceKey = 'userId') => {
  return (req, res, next) => {
    // Admin bisa akses semua
    if (req.user.role === 'admin') {
      return next();
    }

    // Check apakah user adalah pemilik resource
    const resourceUserId = req.params[resourceKey] || req.body[resourceKey];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin.'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeOwner
};
