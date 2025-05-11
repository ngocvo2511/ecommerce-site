const { Sequelize } = require('sequelize');
require('dotenv').config();

// In ra các thông tin từ file .env
console.log('Thông tin kết nối từ .env:');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[được cấu hình]' : '[chưa cấu hình]');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT || '5432 (mặc định)');

// Kết nối trực tiếp và kiểm tra chi tiết
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecommerce',
  process.env.DB_USER || 'ecommerceuser',
  process.env.DB_PASSWORD || 'your_secure_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkConnection() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối thành công!');
    
    // Kiểm tra tên database thực tế
    const [results] = await sequelize.query('SELECT current_database() as db_name');
    console.log('Database hiện tại:', results[0].db_name);
    
    // Kiểm tra schema hiện tại
    const [schemaResults] = await sequelize.query('SELECT current_schema() as schema_name');
    console.log('Schema hiện tại:', schemaResults[0].schema_name);
    
    // Liệt kê tất cả bảng trong schema hiện tại
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${schemaResults[0].schema_name}'
    `);
    console.log('Danh sách bảng trong schema:', tables.map(t => t.table_name));
    
    // Kiểm tra cấu trúc bảng products
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'products'
      `);
      console.log('Cấu trúc bảng products:', columns);
    } catch (error) {
      console.error('Không thể lấy cấu trúc bảng products:', error.message);
    }
  } catch (error) {
    console.error('Không thể kết nối:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkConnection();