const { Position, Application } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all positions (public)
// @route   GET /api/positions
// @access  Public
exports.getAllPositions = async (req, res) => {
  try {
    const { isActive, applicantType, department } = req.query;

    // Build filter
    const where = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (applicantType) {
      where.applicantType = {
        [Op.or]: [applicantType, 'both']
      };
    }
    
    if (department) {
      where.department = department;
    }

    const positions = await Position.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{
        model: Application,
        as: 'applications',
        attributes: ['id', 'status']
      }]
    });

    // Add application count untuk setiap position
    const positionsWithCount = positions.map(position => {
      const positionData = position.toJSON();
      
      // Convert camelCase to snake_case for frontend compatibility
      positionData.applicant_type = positionData.applicantType;
      positionData.is_active = positionData.isActive;
      positionData.start_date = positionData.startDate;
      positionData.end_date = positionData.endDate;
      positionData.created_at = positionData.createdAt;
      positionData.updated_at = positionData.updatedAt;
      
      positionData.applicationsCount = positionData.applications?.length || 0;
      positionData.acceptedCount = positionData.applications?.filter(app => app.status === 'accepted').length || 0;
      delete positionData.applications; // Remove detail applications dari response
      return positionData;
    });

    res.json({
      success: true,
      count: positionsWithCount.length,
      data: positionsWithCount
    });

  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data posisi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single position by ID
// @route   GET /api/positions/:id
// @access  Public
exports.getPositionById = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id, {
      include: [{
        model: Application,
        as: 'applications',
        attributes: ['id', 'status']
      }]
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posisi tidak ditemukan'
      });
    }

    const positionData = position.toJSON();
    positionData.applicationsCount = positionData.applications?.length || 0;
    positionData.acceptedCount = positionData.applications?.filter(app => app.status === 'accepted').length || 0;
    delete positionData.applications;

    res.json({
      success: true,
      data: positionData
    });

  } catch (error) {
    console.error('Get position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data posisi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new position (admin only)
// @route   POST /api/positions
// @access  Private/Admin
exports.createPosition = async (req, res) => {
  try {
    // Normalize field names from snake_case to camelCase if needed
    const positionData = {
      title: req.body.title,
      department: req.body.department,
      description: req.body.description,
      requirements: req.body.requirements,
      quota: req.body.quota,
      duration: req.body.duration,
      applicantType: req.body.applicant_type || req.body.applicantType || 'both',
      isActive: req.body.is_active !== undefined ? req.body.is_active : true,
      startDate: req.body.start_date || req.body.startDate,
      endDate: req.body.end_date || req.body.endDate
    };

    const position = await Position.create(positionData);

    res.status(201).json({
      success: true,
      message: 'Posisi berhasil ditambahkan',
      data: position
    });

  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan posisi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update position (admin only)
// @route   PUT /api/positions/:id
// @access  Private/Admin
exports.updatePosition = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posisi tidak ditemukan'
      });
    }

    // Normalize field names from snake_case to camelCase if needed
    const updateData = {
      title: req.body.title !== undefined ? req.body.title : position.title,
      department: req.body.department !== undefined ? req.body.department : position.department,
      description: req.body.description !== undefined ? req.body.description : position.description,
      requirements: req.body.requirements !== undefined ? req.body.requirements : position.requirements,
      quota: req.body.quota !== undefined ? req.body.quota : position.quota,
      duration: req.body.duration !== undefined ? req.body.duration : position.duration,
      applicantType: req.body.applicant_type !== undefined ? req.body.applicant_type : (req.body.applicantType !== undefined ? req.body.applicantType : position.applicantType),
      isActive: req.body.is_active !== undefined ? req.body.is_active : (req.body.isActive !== undefined ? req.body.isActive : position.isActive),
      startDate: req.body.start_date !== undefined ? req.body.start_date : (req.body.startDate !== undefined ? req.body.startDate : position.startDate),
      endDate: req.body.end_date !== undefined ? req.body.end_date : (req.body.endDate !== undefined ? req.body.endDate : position.endDate)
    };

    await position.update(updateData);

    res.json({
      success: true,
      message: 'Posisi berhasil diupdate',
      data: position
    });

  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update posisi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete position (admin only)
// @route   DELETE /api/positions/:id
// @access  Private/Admin
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posisi tidak ditemukan'
      });
    }

    // Check apakah ada aplikasi yang sudah diterima untuk posisi ini
    const acceptedApplications = await Application.count({
      where: {
        positionId: req.params.id,
        status: 'accepted'
      }
    });

    if (acceptedApplications > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus posisi yang sudah memiliki aplikasi yang diterima'
      });
    }

    await position.destroy();

    res.json({
      success: true,
      message: 'Posisi berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus posisi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle position active status (admin only)
// @route   PATCH /api/positions/:id/toggle-active
// @access  Private/Admin
exports.togglePositionActive = async (req, res) => {
  try {
    const position = await Position.findByPk(req.params.id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Posisi tidak ditemukan'
      });
    }

    position.isActive = !position.isActive;
    await position.save();

    res.json({
      success: true,
      message: `Posisi berhasil ${position.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: position
    });

  } catch (error) {
    console.error('Toggle position error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};