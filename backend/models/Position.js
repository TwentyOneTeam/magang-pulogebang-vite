const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Position = sequelize.define('Position', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Judul posisi tidak boleh kosong' }
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Departemen tidak boleh kosong' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Deskripsi tidak boleh kosong' }
    }
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quota: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      isInt: { msg: 'Kuota harus berupa angka' },
      isGreaterThanOrEqualToZero(value) {
        if (value < 0) {
          throw new Error('Kuota minimal 0 (0 untuk tak terbatas)');
        }
      }
    }
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1-3 bulan'
  },
  applicantType: {
    type: DataTypes.ENUM('mahasiswa', 'pelajar', 'both'),
    defaultValue: 'both',
    allowNull: false,
    comment: 'Jenis pelamar yang diterima'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Status lowongan masih dibuka atau tidak'
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'positions'
});

module.exports = Position;