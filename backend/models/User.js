const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama tidak boleh kosong' },
      len: {
        args: [3, 100],
        msg: 'Nama harus antara 3-100 karakter'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email sudah terdaftar'
    },
    validate: {
      isEmail: { msg: 'Format email tidak valid' },
      notEmpty: { msg: 'Email tidak boleh kosong' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password tidak boleh kosong' },
      len: {
        args: [8, 100],
        msg: 'Password minimal 8 karakter'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: {
        args: /^[0-9+\-() ]*$/,
        msg: 'Nomor telepon tidak valid'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Email verification status'
  },
  otpCode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '6-digit OTP code'
  },
  otpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'OTP expiration time (5 minutes from generation)'
  },
  resetOtp: {
    type: DataTypes.STRING(6),
    allowNull: true,
    comment: '6-digit OTP code for password reset'
  },
  resetOtpExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Reset OTP expiration time (10 minutes from generation)'
  }
}, {
  tableName: 'users',
  hooks: {
    // Hash password sebelum create
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hash password sebelum update
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method untuk compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method untuk hide password saat return JSON
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
