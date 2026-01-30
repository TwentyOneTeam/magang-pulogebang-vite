const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi koneksi PostgreSQL
// Dukung baik DATABASE_URL (untuk Railway) maupun konfigurasi individual

let sequelize;

if (process.env.DATABASE_URL) {
  // Gunakan DATABASE_URL jika tersedia (untuk Railway, Heroku, dll)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
    }
  });
} else {
  // Gunakan konfigurasi individual untuk development lokal
  sequelize = new Sequelize(
    process.env.DB_NAME || 'magang_pulogebang',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
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
}

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
    console.error('   4. PostgreSQL service sudah running');
    console.error('   5. Atau gunakan DATABASE_URL untuk connection string\n');
    return false;
  }
};

module.exports = { sequelize, testConnection };
