const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadsBaseDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsBaseDir)) {
  fs.mkdirSync(uploadsBaseDir, { recursive: true });
}

// Konfigurasi storage dengan folder per application ID
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan temporary folder untuk uploads
    const tempDir = path.join(uploadsBaseDir, 'temp');
    
    // Buat folder temp jika belum ada
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique identifier untuk saat ini
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const tempId = `${timestamp}-${random}`;
    
    // Tentukan tipe file berdasarkan fieldname
    const fieldNameMap = {
      'coverLetterFile': 'surat_permohonan',
      'ktpFile': 'ktp',
      'kkFile': 'kk',
      'photoFile': 'pas_foto',
      'cvFile': 'cv',
      'suratPengantarFile': 'surat_pengantar'
    };
    
    let fileType = fieldNameMap[file.fieldname] || 'file';
    
    // Format: tempId_fileType.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${tempId}_${fileType}${ext}`;
    
    // Simpan tempId ke req untuk nanti rename
    if (!req.uploadTempId) {
      req.uploadTempId = tempId;
    }
    if (!req.uploadedFiles) {
      req.uploadedFiles = {};
    }
    req.uploadedFiles[file.fieldname] = {
      originalFilename: filename,
      fieldname: file.fieldname,
      fileType: fileType
    };
    
    cb(null, filename);
  }
});

// File filter (hanya terima file tertentu)
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidType = Object.entries(allowedTypes).some(
    ([mimeType, extensions]) => 
      file.mimetype === mimeType && extensions.includes(ext)
  );

  if (isValidType) {
    cb(null, true);
  } else {
    cb(new Error(`Tipe file tidak diizinkan. Hanya menerima: JPG, PNG, PDF, DOC, DOCX`), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // Default 5MB
  }
});

// Middleware untuk handle multiple files dengan field names - semua required
const uploadApplicationFiles = upload.fields([
  { name: 'coverLetterFile', maxCount: 1 },  // Surat Permohonan (required)
  { name: 'ktpFile', maxCount: 1 },          // KTP (required)
  { name: 'kkFile', maxCount: 1 },           // KK (required)
  { name: 'photoFile', maxCount: 1 },        // Pas Foto (required)
  { name: 'cvFile', maxCount: 1 },           // CV/Resume (required)
  { name: 'suratPengantarFile', maxCount: 1 } // Surat Pengantar (optional)
]);

// Error handler middleware untuk multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Ukuran file terlalu besar. Maksimal ${(parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024}MB`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Terlalu banyak file atau nama field tidak sesuai'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// Helper function untuk delete file
const deleteFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function untuk move dan rename files berdasarkan application ID
const moveAndRenameFiles = (uploadedFiles, applicationId) => {
  try {
    const uploadsBaseDir = path.join(__dirname, '../uploads');
    const tempDir = path.join(uploadsBaseDir, 'temp');
    const appDir = path.join(uploadsBaseDir, applicationId);
    
    // Buat folder application jika belum ada
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
    }
    
    const renamedFiles = {};
    
    // Untuk setiap file yang di-upload
    Object.entries(uploadedFiles).forEach(([fieldname, fileInfo]) => {
      const oldPath = path.join(tempDir, fileInfo.originalFilename);
      const newFilename = `${applicationId}_${fileInfo.fileType}${path.extname(fileInfo.originalFilename)}`;
      const newPath = path.join(appDir, newFilename);
      
      // Pindahkan dan rename file
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        renamedFiles[fieldname] = `${applicationId}/${newFilename}`;
      }
    });
    
    // Delete temp folder jika kosong
    try {
      if (fs.existsSync(tempDir) && fs.readdirSync(tempDir).length === 0) {
        fs.rmdirSync(tempDir);
      }
    } catch (err) {
      // Ignore error saat delete temp folder
    }
    
    return renamedFiles;
  } catch (error) {
    console.error('Error moving and renaming files:', error);
    throw error;
  }
};

module.exports = {
  uploadApplicationFiles,
  handleMulterError,
  deleteFile,
  moveAndRenameFiles
};