const nodemailer = require('nodemailer');

// Check if email credentials are provided
const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Initialize email transporter using Gmail SMTP
// Only create transporter if credentials are available
const transporter = hasEmailConfig ? nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  // Timeout settings for Railway (increased from default)
  connectionTimeout: 5 * 60 * 1000, // 5 minutes
  socketTimeout: 5 * 60 * 1000,     // 5 minutes
  pool: {
    maxConnections: 1,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  }
}) : null;

// Verify connection only if email is configured
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email configuration error:', error.message);
      console.error('📌 Please check:');
      console.error('   1. EMAIL_USER is set (Gmail address)');
      console.error('   2. EMAIL_PASSWORD is Gmail App Password (not regular password)');
      console.error('   3. Gmail account has 2FA enabled');
      console.error('   4. Gmail account allows app passwords');
    } else {
      console.log('✅ Email transporter ready');
    }
  });
} else {
  console.warn('⚠️  Email not configured. OTP features will be disabled.');
  console.warn('📌 To enable email, set EMAIL_USER and EMAIL_PASSWORD in environment variables');
}

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otpCode, userName = 'User', type = 'verification') => {
  // Check if email is configured
  if (!transporter) {
    console.warn('⚠️  Email not configured. Cannot send OTP.');
    throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD.');
  }

  const currentYear = new Date().getFullYear();
  
  const emailSubjects = {
    verification: 'Kode Verifikasi Email - Sistem Magang Kelurahan Pulo Gebang',
    reset: 'Kode Reset Password - Sistem Magang Kelurahan Pulo Gebang'
  };

  const emailDescriptions = {
    verification: 'Anda telah melakukan pendaftaran di Sistem Informasi Magang Kelurahan Pulo Gebang. Gunakan kode OTP di bawah ini untuk memverifikasi email Anda.',
    reset: 'Anda telah meminta reset password di Sistem Informasi Magang Kelurahan Pulo Gebang. Gunakan kode OTP di bawah ini untuk mereset password Anda.'
  };

  const otpValidity = {
    verification: '5 menit',
    reset: '5 menit'
  };

  const description = emailDescriptions[type] || emailDescriptions.verification;
  const validity = otpValidity[type] || '5 menit';
  
  const mailOptions = {
    from: `Magang Pulo Gebang <${process.env.EMAIL_USER}>`,
    to: email,
    subject: emailSubjects[type] || emailSubjects.verification,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 20px;">Kode OTP Anda</h2>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
            Halo <strong>${userName}</strong>,
          </p>
          
          <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
            ${description}
          </p>
          
          <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 12px; margin: 0 0 10px 0; color: #e0e0e0;">Kode OTP</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 0;">
              ${otpCode}
            </p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin: 20px 0;">
            Kode ini akan berlaku selama <strong>${validity}</strong>.
          </p>
          
          <p style="color: #999; font-size: 12px; margin: 20px 0;">
            Jika Anda tidak melakukan permintaan ini, abaikan email ini.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 11px; text-align: center;">
            © ${currentYear} Sistem Informasi Magang Kelurahan Pulo Gebang. All rights reserved.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  transporter
};
