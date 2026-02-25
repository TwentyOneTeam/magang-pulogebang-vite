const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'magang_pulogebang',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke PostgreSQL berhasil!');
    return true;
  } catch (error) {
    console.error('❌ Tidak dapat terhubung ke database:', error.message);
    console.error('\n📌 Pastikan:');
    console.error('   1. PostgreSQL sudah terinstall dan berjalan');
    console.error('   2. Database "magang_pulogebang" sudah dibuat');
    console.error('   3. Username dan password di .env sudah benar');
    console.error('   4. PostgreSQL service sudah running\n');
    return false;
  }
};

module.exports = { sequelize, testConnection };
