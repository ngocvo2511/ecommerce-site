const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const auth = require('../middleware/auth');

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }
    
    // Tạo người dùng mới
    const user = await User.create({ name, email, password });
    
    // Tạo token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Lưu token vào cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });
    
    res.status(201).json({
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Kiểm tra mật khẩu
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Tạo token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Lưu token vào cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 ngày
    });
    
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Đăng xuất thành công' });
});

// Lấy thông tin người dùng hiện tại
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;