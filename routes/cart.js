const express = require('express');
const router = express.Router();
const { Cart, Product, Order, OrderItem } = require('../models');
const auth = require('../middleware/auth');
const { sequelize } = require('../config/db');

// Middleware xác thực cho tất cả các routes
router.use(auth);

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Product }]
    });
    
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }
    
    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    let cartItem = await Cart.findOne({
      where: { 
        UserId: req.user.id,
        ProductId: productId
      }
    });
    
    if (cartItem) {
      // Cập nhật số lượng nếu đã tồn tại
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Tạo mới nếu chưa tồn tại
      cartItem = await Cart.create({
        UserId: req.user.id,
        ProductId: productId,
        quantity
      });
    }
    
    // Lấy thông tin chi tiết sản phẩm
    cartItem = await Cart.findOne({
      where: { id: cartItem.id },
      include: [{ model: Product }]
    });
    
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Kiểm tra số lượng hợp lệ
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }
    
    // Tìm item trong giỏ hàng
    const cartItem = await Cart.findOne({
      where: { 
        id: req.params.id,
        UserId: req.user.id
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Cập nhật số lượng
    cartItem.quantity = quantity;
    await cartItem.save();
    
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', async (req, res) => {
  try {
    // Tìm item trong giỏ hàng
    const cartItem = await Cart.findOne({
      where: { 
        id: req.params.id,
        UserId: req.user.id
      }
    });
    
    if (!cartItem) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Xóa item
    await cartItem.destroy();
    
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

// Tạo đơn hàng từ giỏ hàng
router.post('/checkout', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { address, phone } = req.body;
    
    // Kiểm tra thông tin giao hàng
    if (!address || !phone) {
      return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ và số điện thoại' });
    }
    
    // Lấy giỏ hàng của người dùng
    const cartItems = await Cart.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Product }],
      transaction: t
    });
    
    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }
    
    // Tính tổng giá trị đơn hàng
    let total = 0;
    cartItems.forEach(item => {
      total += item.Product.price * item.quantity;
    });
    
    // Tạo đơn hàng
    const order = await Order.create({
      UserId: req.user.id,
      total,
      status: 'pending',
      address,
      phone
    }, { transaction: t });
    
    // Tạo các mục đơn hàng
    const orderItems = [];
    for (const item of cartItems) {
      const orderItem = await OrderItem.create({
        OrderId: order.id,
        ProductId: item.ProductId,
        quantity: item.quantity,
        price: item.Product.price
      }, { transaction: t });
      
      orderItems.push(orderItem);
      
      // Cập nhật tồn kho
      const product = item.Product;
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Sản phẩm ${product.name} không đủ số lượng trong kho` 
        });
      }
      
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }
    
    // Xóa giỏ hàng
    await Cart.destroy({
      where: { UserId: req.user.id },
      transaction: t
    });
    
    await t.commit();
    
    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: {
        id: order.id,
        total: order.total,
        status: order.status
      }
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
  }
});

module.exports = router;