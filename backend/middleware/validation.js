const { body, validationResult } = require('express-validator');

// Middleware untuk check validation result
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules untuk register
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama tidak boleh kosong')
    .isLength({ min: 3, max: 100 }).withMessage('Nama harus antara 3-100 karakter'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email tidak boleh kosong')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password tidak boleh kosong')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-() ]*$/).withMessage('Nomor telepon tidak valid')
];

// Validation rules untuk login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email tidak boleh kosong')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password tidak boleh kosong')
];

// Validation rules untuk create position
const positionValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Judul posisi tidak boleh kosong'),
  
  body('department')
    .trim()
    .notEmpty().withMessage('Departemen tidak boleh kosong'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Deskripsi tidak boleh kosong'),
  
  body('quota')
    .optional()
    .isInt({ min: 0 }).withMessage('Kuota minimal 0 (0 untuk tak terbatas)'),
  
  body('applicantType')
    .optional()
    .isIn(['mahasiswa', 'pelajar', 'both']).withMessage('Tipe pelamar tidak valid')
];

// Validation rules untuk application
const applicationValidation = [
  body('applicantType')
    .notEmpty().withMessage('Tipe pelamar tidak boleh kosong')
    .isIn(['mahasiswa', 'pelajar']).withMessage('Tipe pelamar harus mahasiswa atau pelajar'),
  
  body('fullName')
    .trim()
    .notEmpty().withMessage('Nama lengkap tidak boleh kosong')
    .isLength({ min: 3, max: 100 }).withMessage('Nama lengkap harus antara 3-100 karakter'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email tidak boleh kosong')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Nomor telepon tidak boleh kosong')
    .matches(/^[0-9+\-() ]*$/).withMessage('Nomor telepon tidak valid'),
  
  body('birthDate')
    .notEmpty().withMessage('Tanggal lahir tidak boleh kosong')
    .isISO8601().withMessage('Format tanggal tidak valid'),
  
  body('gender')
    .notEmpty().withMessage('Jenis kelamin tidak boleh kosong')
    .isIn(['L', 'P']).withMessage('Jenis kelamin harus L atau P'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Alamat tidak boleh kosong'),
  
  body('positionId')
    .notEmpty().withMessage('Posisi magang tidak boleh kosong')
    .isUUID().withMessage('ID posisi tidak valid'),
  
  body('startDate')
    .notEmpty().withMessage('Tanggal mulai tidak boleh kosong')
    .isISO8601().withMessage('Format tanggal mulai tidak valid'),
  
  body('endDate')
    .notEmpty().withMessage('Tanggal selesai tidak boleh kosong')
    .isISO8601().withMessage('Format tanggal selesai tidak valid')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('Tanggal selesai harus lebih besar dari tanggal mulai');
      }
      return true;
    }),

  // Validasi untuk mahasiswa
  body('npm')
    .if(body('applicantType').equals('mahasiswa'))
    .trim()
    .notEmpty().withMessage('NPM/NIM tidak boleh kosong untuk mahasiswa'),
  
  body('university')
    .if(body('applicantType').equals('mahasiswa'))
    .trim()
    .notEmpty().withMessage('Universitas tidak boleh kosong untuk mahasiswa'),
  
  body('major')
    .if(body('applicantType').equals('mahasiswa'))
    .trim()
    .notEmpty().withMessage('Program studi tidak boleh kosong untuk mahasiswa'),

  // Validasi untuk pelajar
  body('nis')
    .if(body('applicantType').equals('pelajar'))
    .trim()
    .notEmpty().withMessage('NIS tidak boleh kosong untuk pelajar'),
  
  body('schoolName')
    .if(body('applicantType').equals('pelajar'))
    .trim()
    .notEmpty().withMessage('Nama sekolah tidak boleh kosong untuk pelajar'),
  
  body('schoolType')
    .if(body('applicantType').equals('pelajar'))
    .notEmpty().withMessage('Jenis sekolah tidak boleh kosong untuk pelajar')
    .isIn(['SMA', 'SMK']).withMessage('Jenis sekolah harus SMA atau SMK'),
  
  body('grade')
    .if(body('applicantType').equals('pelajar'))
    .trim()
    .notEmpty().withMessage('Kelas tidak boleh kosong untuk pelajar'),
  
  body('studentMajor')
    .if(body('applicantType').equals('pelajar'))
    .trim()
    .notEmpty().withMessage('Jurusan tidak boleh kosong untuk pelajar')
];

// Validation untuk update status application
const updateStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status tidak boleh kosong')
    .isIn(['pending', 'review', 'accepted', 'rejected']).withMessage('Status tidak valid'),
  
  body('adminNotes')
    .optional()
    .trim()
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  positionValidation,
  applicationValidation,
  updateStatusValidation
};
