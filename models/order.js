const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'orders',
  freezeTableName: true
});


const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  freezeTableName: true
});


// Thiết lập mối quan hệ
Order.belongsTo(User);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(require('./product'));
Order.hasMany(OrderItem);

module.exports = { Order, OrderItem };