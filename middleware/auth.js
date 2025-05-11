const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy người dùng' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Không xác thực được token' });
  }
};

module.exports = auth;