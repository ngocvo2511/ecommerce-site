const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    define: {
    underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối đến cơ sở dữ liệu thành công');
    
    // Đồng bộ hóa các mô hình với cơ sở dữ liệu
    await sequelize.sync();
    console.log('Đồng bộ hóa cơ sở dữ liệu hoàn tất');
  } catch (error) {
    console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };