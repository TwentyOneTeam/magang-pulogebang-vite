const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Foreign Keys
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  positionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'positions',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },

  // Nomor Registrasi (auto-generated)
  registrationNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },

  // Tipe Pelamar
  applicantType: {
    type: DataTypes.ENUM('mahasiswa', 'pelajar'),
    allowNull: false
  },

  // Data Pribadi
  nik: {
    type: DataTypes.STRING(16),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'NIK tidak boleh kosong' },
      len: {
        args: [16, 16],
        msg: 'NIK harus tepat 16 karakter'
      },
      isNumeric: { msg: 'NIK harus berisi angka saja' }
    },
    comment: 'Nomor Induk Kependudukan (16 digit)'
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nama lengkap tidak boleh kosong' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Format email tidak valid' }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Nomor telepon tidak boleh kosong' }
    }
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  // Data Institusi - Mahasiswa
  npm: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'NPM/NIM untuk mahasiswa'
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nama universitas untuk mahasiswa'
  },
  major: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Program studi untuk mahasiswa'
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Semester saat ini untuk mahasiswa'
  },

  // Data Institusi - Pelajar
  nis: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'NIS untuk pelajar'
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nama sekolah untuk pelajar'
  },
  schoolType: {
    type: DataTypes.ENUM('SMA', 'SMK'),
    allowNull: true,
    comment: 'Jenis sekolah untuk pelajar'
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Kelas untuk pelajar (10, 11, 12)'
  },
  studentMajor: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Jurusan untuk pelajar (IPA, IPS, atau jurusan SMK)'
  },

  // Periode Magang
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  // Dokumen Upload (path file)
  ktpFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file KTP'
  },
  kkFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file Kartu Keluarga'
  },
  coverLetterFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file Surat Pengantar'
  },
  photoFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file Foto 3x4'
  },
  cvFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file CV (optional untuk pelajar, wajib untuk mahasiswa)'
  },
  suratPengantarFile: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path file Surat Pengantar dari institusi (opsional)'
  },
  additionalFiles: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string array untuk multiple uploaded files'
  },

  // Status & Admin Notes
  status: {
    type: DataTypes.ENUM('pending', 'review', 'accepted', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan dari admin'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Admin yang mereview'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'applications',
  hooks: {
    beforeCreate: async (application) => {
      // Generate registration number: REG-YYYYMMDD-XXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      
      application.registrationNumber = `REG-${year}${month}${day}-${random}`;
    }
  }
});

module.exports = Application;