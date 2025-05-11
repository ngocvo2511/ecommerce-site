const express = require('express');
const router = express.Router();
const { Product, Order } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/admin');

// Middleware xác thực admin cho tất cả các routes
router.use(auth, isAdmin);

// --- QUẢN LÝ SẢN PHẨM ---

// Lấy tất cả sản phẩm (admin)
router.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Thêm sản phẩm mới
router.post('/products', async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;
    const product = await Product.create({ 
      name, 
      description, 
      price, 
      stock, 
      image, 
      category 
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Cập nhật sản phẩm
router.put('/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock, image, category } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    await product.update({ 
      name, 
      description, 
      price, 
      stock, 
      image, 
      category 
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Xóa sản phẩm
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    await product.destroy();
    res.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// --- QUẢN LÝ ĐƠN HÀNG ---

// Lấy tất cả đơn hàng
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ all: true, nested: true }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

module.exports = router;