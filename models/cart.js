const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');
const Product = require('./product');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'carts',
  freezeTableName: true
});


// Thiết lập mối quan hệ
Cart.belongsTo(User);
Cart.belongsTo(Product);

module.exports = Cart;