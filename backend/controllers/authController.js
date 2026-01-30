const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { generateOTP, sendOTPEmail } = require('../config/email');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register user baru
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check apakah email sudah terdaftar
    let existingUser = await User.findOne({ where: { email } });
    
    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    if (existingUser) {
      // Jika user sudah ada tetapi belum verified, update data
      if (!existingUser.isVerified) {
        // Update user data dengan input terbaru dan OTP baru
        existingUser.name = name;
        existingUser.password = password; // Will be hashed by hook
        existingUser.phone = phone;
        existingUser.otpCode = otpCode;
        existingUser.otpExpiresAt = otpExpiresAt;
        
        await existingUser.save();
        
        // Send OTP email
        try {
          await sendOTPEmail(email, otpCode, name);
        } catch (emailError) {
          console.error('Failed to send OTP email:', emailError);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengirim kode OTP. Silakan coba lagi.'
          });
        }

        return res.status(201).json({
          success: true,
          message: 'Data terdaftar, kode OTP telah dikirim ulang ke email Anda. Silakan verifikasi dalam 5 menit.',
          data: {
            email: existingUser.email,
            requiresVerification: true
          }
        });
      } else {
        // User sudah verified
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar dan terverifikasi. Silakan login.'
        });
      }
    }

    // Create user baru dengan status belum verified
    const newUser = await User.create({
      name,
      email,
      password, // Will be hashed by hook
      phone,
      isVerified: false,
      otpCode,
      otpExpiresAt,
      role: 'user' // Default role adalah user
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim kode OTP. Silakan coba lagi.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda. Silakan verifikasi dalam 5 menit.',
      data: {
        email: newUser.email,
        requiresVerification: true
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
    }

    // Check apakah user aktif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Akun Anda tidak aktif. Silakan hubungi administrator.'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile berhasil diupdate',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Update password (akan auto-hash oleh hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Validate input
    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kode OTP harus diisi'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check jika user sudah verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terverifikasi. Silakan login.'
      });
    }

    // Check jika OTP sudah expired
    if (!user.otpExpiresAt || new Date() > new Date(user.otpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP sudah kadaluarsa. Silakan daftar ulang atau minta OTP baru.'
      });
    }

    // Verify OTP code
    if (user.otpCode !== otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP tidak valid'
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Email berhasil diverifikasi',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat verifikasi OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Check jika user sudah verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terverifikasi. Silakan login.'
      });
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otpCode, user.name);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim kode OTP. Silakan coba lagi.'
      });
    }

    res.json({
      success: true,
      message: 'Kode OTP baru telah dikirim ke email Anda. Silakan verifikasi dalam 5 menit.'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengirim ulang OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password - Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // SECURITY: Always return success message to prevent email enumeration
    // Even if user doesn't exist, we return success
    if (!user) {
      return res.json({
        success: true,
        message: 'Jika email Anda terdaftar, kode OTP untuk reset password telah dikirim'
      });
    }

    // Generate reset OTP
    const resetOtp = generateOTP();
    const resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update user with reset OTP
    user.resetOtp = resetOtp;
    user.resetOtpExpiresAt = resetOtpExpiresAt;
    await user.save();

    // Send reset OTP email
    try {
      await sendOTPEmail(email, resetOtp, user.name, 'reset');
    } catch (emailError) {
      console.error('Failed to send reset OTP email:', emailError);
      // Still return success to avoid leaking email existence
      return res.json({
        success: true,
        message: 'Jika email Anda terdaftar, kode OTP untuk reset password telah dikirim'
      });
    }

    res.json({
      success: true,
      message: 'Jika email Anda terdaftar, kode OTP untuk reset password telah dikirim'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses permintaan reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetOtp, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !resetOtp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, dan password baru harus diisi'
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak cocok'
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 8 karakter'
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // SECURITY: Return generic message to prevent email enumeration attack
    // Even if user doesn't exist, we return a generic error message
    // This prevents attackers from knowing which emails are registered
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, atau password tidak valid'
      });
    }

    // Check if reset OTP expired
    if (!user.resetOtpExpiresAt || new Date() > new Date(user.resetOtpExpiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'Kode OTP sudah kadaluarsa. Silakan minta OTP baru.'
      });
    }

    // Verify reset OTP code
    if (user.resetOtp !== resetOtp) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, atau password tidak valid'
      });
    }

    // Update password with bcrypt hashing (will be handled by beforeUpdate hook)
    user.password = newPassword;
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru Anda.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mereset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
