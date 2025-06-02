const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized: Invalid user' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

module.exports = authMiddleware;
