const { Application, Position, User } = require('../models');
const path = require('path');
const fs = require('fs');
const { deleteFile, moveAndRenameFiles } = require('../middleware/upload');

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const {
      applicantType,
      nik,
      fullName,
      email,
      phone,
      birthDate,
      gender,
      address,
      positionId,
      startDate,
      endDate,
      // Mahasiswa fields
      npm,
      university,
      major,
      semester,
      // Pelajar fields
      nis,
      schoolName,
      schoolType,
      grade,
      studentMajor
    } = req.body;

    // Check apakah position exists dan aktif
    const position = await Position.findByPk(positionId);
    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posisi magang tidak ditemukan'
      });
    }

    if (!position.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Posisi magang sudah tidak aktif'
      });
    }

    // Check quota
    const acceptedCount = await Application.count({
      where: {
        positionId,
        status: 'accepted'
      }
    });

    if (position.quota > 0 && acceptedCount >= position.quota) {
      return res.status(400).json({
        success: false,
        message: 'Kuota untuk posisi ini sudah penuh'
      });
    }

    // Check maximum active applications limit (max 3 active slots)
    // Active status are: pending (Diajukan), review (Sedang ditinjau), accepted (Diterima)
    const MAX_ACTIVE_SLOTS = 3;
    const activeApplicationsCount = await Application.count({
      where: {
        userId: req.user.id,
        status: ['pending', 'review', 'accepted']
      }
    });

    if (activeApplicationsCount >= MAX_ACTIVE_SLOTS) {
      return res.status(400).json({
        success: false,
        message: `Anda sudah memiliki ${MAX_ACTIVE_SLOTS} pendaftaran yang sedang aktif. Tunggu hingga ada yang selesai atau ditolak untuk mendaftar lagi.`
      });
    }

    // Allow multiple applications from same user for same position

    // Get uploaded files
    const files = req.files || {};
    
    // Prepare application data
    const applicationData = {
      userId: req.user.id,
      positionId,
      applicantType,
      nik,
      fullName,
      email,
      phone,
      birthDate,
      gender,
      address,
      startDate,
      endDate,
      status: 'pending'
    };

    // Create application first to get ID
    const application = await Application.create(applicationData);

    // Move and rename uploaded files to application folder
    let renamedFiles = {};
    if (req.uploadedFiles && Object.keys(req.uploadedFiles).length > 0) {
      renamedFiles = moveAndRenameFiles(req.uploadedFiles, application.id);
    }

    // Add files paths with new names
    // Surat Permohonan (required)
    if (renamedFiles.coverLetterFile) {
      application.coverLetterFile = renamedFiles.coverLetterFile;
    }
    if (files.coverLetterFile && files.coverLetterFile[0] && !renamedFiles.coverLetterFile) {
      application.coverLetterFile = `${application.id}/${files.coverLetterFile[0].filename}`;
    }
    
    // KTP (required)
    if (renamedFiles.ktpFile) {
      application.ktpFile = renamedFiles.ktpFile;
    }
    if (files.ktpFile && files.ktpFile[0] && !renamedFiles.ktpFile) {
      application.ktpFile = `${application.id}/${files.ktpFile[0].filename}`;
    }
    
    // KK (required)
    if (renamedFiles.kkFile) {
      application.kkFile = renamedFiles.kkFile;
    }
    if (files.kkFile && files.kkFile[0] && !renamedFiles.kkFile) {
      application.kkFile = `${application.id}/${files.kkFile[0].filename}`;
    }
    
    // Pas Foto (required)
    if (renamedFiles.photoFile) {
      application.photoFile = renamedFiles.photoFile;
    }
    if (files.photoFile && files.photoFile[0] && !renamedFiles.photoFile) {
      application.photoFile = `${application.id}/${files.photoFile[0].filename}`;
    }
    
    // CV/Resume (required)
    if (renamedFiles.cvFile) {
      application.cvFile = renamedFiles.cvFile;
    }
    if (files.cvFile && files.cvFile[0] && !renamedFiles.cvFile) {
      application.cvFile = `${application.id}/${files.cvFile[0].filename}`;
    }
    
    // Surat Pengantar (optional)
    if (renamedFiles.suratPengantarFile) {
      application.suratPengantarFile = renamedFiles.suratPengantarFile;
    }
    if (files.suratPengantarFile && files.suratPengantarFile[0] && !renamedFiles.suratPengantarFile) {
      application.suratPengantarFile = `${application.id}/${files.suratPengantarFile[0].filename}`;
    }

    // Add type-specific fields
    if (applicantType === 'mahasiswa') {
      application.npm = npm;
      application.university = university;
      application.major = major;
      application.semester = semester;
    } else if (applicantType === 'pelajar') {
      application.nis = nis;
      application.schoolName = schoolName;
      application.schoolType = schoolType;
      application.grade = grade;
      application.studentMajor = studentMajor;
    }

    // Save application with updated data
    await application.save();

    // Fetch full data with relations
    const fullApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'title', 'department']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil disubmit',
      data: fullApplication
    });

  } catch (error) {
    console.error('Create application error:', error);
    
    // Delete uploaded files jika terjadi error - dengan struktur folder baru
    if (req.files && req.body.fullName) {
      const folderName = req.body.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      Object.values(req.files).forEach(fileArray => {
        fileArray.forEach(file => {
          deleteFile(path.join(__dirname, '../uploads', folderName, file.filename));
        });
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat submit pendaftaran',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all applications (admin bisa lihat semua, user hanya miliknya)
// @route   GET /api/applications
// @access  Private
exports.getAllApplications = async (req, res) => {
  try {
    const { status, applicantType, positionId } = req.query;

    // Build filter
    const where = {};
    
    // User biasa hanya bisa lihat aplikasinya sendiri
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }
    
    if (applicantType) {
      where.applicantType = applicantType;
    }
    
    if (positionId) {
      where.positionId = positionId;
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'title', 'department', 'duration', 'applicantType']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map data to use snake_case for API consistency
    const mappedApplications = applications.map(app => {
      const data = app.toJSON();
      return {
        ...data,
        full_name: data.fullName,
        applicant_type: data.applicantType,
        institution: data.applicantType === 'mahasiswa' ? data.university : data.schoolName,
        student_id: data.applicantType === 'mahasiswa' ? data.npm : data.nis,
        school_type: data.schoolType,
        position_id: data.positionId,
        admin_notes: data.adminNotes,
        ktp_file: data.ktpFile,
        kk_file: data.kkFile,
        cover_letter_file: data.coverLetterFile,
        photo_file: data.photoFile,
        cv_file: data.cvFile,
        surat_pengantar_file: data.suratPengantarFile,
        additional_files: data.additionalFiles,
        start_date: data.startDate,
        end_date: data.endDate,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
        reviewed_by: data.reviewedBy,
        reviewed_at: data.reviewedAt,
        registration_number: data.registrationNumber,
        birth_date: data.birthDate
      };
    });

    res.json({
      success: true,
      count: mappedApplications.length,
      data: mappedApplications
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data aplikasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        {
          model: Position,
          as: 'position'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplikasi tidak ditemukan'
      });
    }

    // User biasa hanya bisa lihat aplikasinya sendiri
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    // Map data to use snake_case for API consistency
    const data = application.toJSON();
    const mappedData = {
      ...data,
      full_name: data.fullName,
      applicant_type: data.applicantType,
      institution: data.applicantType === 'mahasiswa' ? data.university : data.schoolName,
      student_id: data.applicantType === 'mahasiswa' ? data.npm : data.nis,
      school_type: data.schoolType,
      position_id: data.positionId,
      admin_notes: data.adminNotes,
      ktp_file: data.ktpFile,
      kk_file: data.kkFile,
      cover_letter_file: data.coverLetterFile,
      photo_file: data.photoFile,
      cv_file: data.cvFile,
      surat_pengantar_file: data.suratPengantarFile,
      additional_files: data.additionalFiles,
      start_date: data.startDate,
      end_date: data.endDate,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      reviewed_by: data.reviewedBy,
      reviewed_at: data.reviewedAt,
      registration_number: data.registrationNumber,
      birth_date: data.birthDate
    };

    res.json({
      success: true,
      data: mappedData
    });

  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data aplikasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update application status (admin only)
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplikasi tidak ditemukan'
      });
    }

    // Update status
    application.status = status;
    application.adminNotes = adminNotes || application.adminNotes;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();

    await application.save();

    // Fetch updated data with relations
    const updatedApplication = await Application.findByPk(application.id, {
      include: [
        {
          model: Position,
          as: 'position',
          attributes: ['id', 'title', 'department']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        }
      ]
    });

    // Map data to use snake_case for API consistency
    const data = updatedApplication.toJSON();
    const mappedData = {
      ...data,
      full_name: data.fullName,
      applicant_type: data.applicantType,
      institution: data.applicantType === 'mahasiswa' ? data.university : data.schoolName,
      student_id: data.applicantType === 'mahasiswa' ? data.npm : data.nis,
      school_type: data.schoolType,
      position_id: data.positionId,
      admin_notes: data.adminNotes,
      ktp_file: data.ktpFile,
      kk_file: data.kkFile,
      cover_letter_file: data.coverLetterFile,
      photo_file: data.photoFile,
      cv_file: data.cvFile,
      surat_pengantar_file: data.suratPengantarFile,
      additional_files: data.additionalFiles,
      start_date: data.startDate,
      end_date: data.endDate,
      created_at: data.createdAt,
      updated_at: data.updatedAt,
      reviewed_by: data.reviewedBy,
      reviewed_at: data.reviewedAt,
      registration_number: data.registrationNumber,
      birth_date: data.birthDate
    };

    res.json({
      success: true,
      message: 'Status aplikasi berhasil diupdate',
      data: mappedData
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Aplikasi tidak ditemukan'
      });
    }

    // User biasa hanya bisa delete aplikasinya sendiri
    if (req.user.role !== 'admin' && application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak'
      });
    }

    // User tidak bisa delete aplikasi yang sudah di-review atau diterima
    if (application.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Hanya pengajuan dengan status pending yang dapat dihapus'
      });
    }

    // Delete uploaded files and folder
    const uploadDir = path.join(__dirname, '../uploads');
    const applicationDir = path.join(uploadDir, application.id);
    
    // Delete entire application folder if it exists
    if (fs.existsSync(applicationDir)) {
      fs.rmSync(applicationDir, { recursive: true, force: true });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Aplikasi berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus aplikasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get application statistics (admin only)
// @route   GET /api/applications/stats
// @access  Private/Admin
exports.getApplicationStats = async (req, res) => {
  try {
    const { Op } = require('sequelize');

    const total = await Application.count();
    const pending = await Application.count({ where: { status: 'pending' } });
    const review = await Application.count({ where: { status: 'review' } });
    const accepted = await Application.count({ where: { status: 'accepted' } });
    const rejected = await Application.count({ where: { status: 'rejected' } });
    const mahasiswa = await Application.count({ where: { applicantType: 'mahasiswa' } });
    const pelajar = await Application.count({ where: { applicantType: 'pelajar' } });

    const thisMonth = await Application.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const stats = {
      total,
      pending,
      review,
      accepted,
      rejected,
      byApplicantType: {
        mahasiswa,
        pelajar
      },
      thisMonth
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};