const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

module.exports = router;