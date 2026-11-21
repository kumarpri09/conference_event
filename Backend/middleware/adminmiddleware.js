
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.checkToken = async (req, res, next) => {
  
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.requireAuth = async (req, res, next) => {
  
  const user = await dbModel.findOne({ email: req.user.email });
  if (!user) {
    return res.status(401).json({ message: 'User not found in database' });
  }
  next();
};