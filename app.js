const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
require('dotenv').config();

// Khởi tạo Express
const app = express();

// Kết nối cơ sở dữ liệu
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin', require('./routes/admin'));

// Phục vụ HTML từ thư mục views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/product-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product-detail.html'));
});

app.get('/cart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'cart.html'));
});

app.get('/checkout.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});

app.get('/admin/products.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'products.html'));
});

app.get('/admin/orders.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'orders.html'));
});

// Xử lý các URL không khớp với route nào ở trên
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

module.exports = app;