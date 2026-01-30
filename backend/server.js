const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const positionRoutes = require('./routes/positions');
const applicationRoutes = require('./routes/applications');
const chatRoutes = require('./routes/chat');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads folder) with CORS
app.use('/uploads', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}), express.static(path.join(__dirname, 'uploads')));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di API Sistem Magang Kelurahan Pulo Gebang',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      positions: '/api/positions',
      applications: '/api/applications',
      chat: '/api/chat'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// File download endpoint (with CORS applied by global middleware)
app.get('/api/file/*', (req, res) => {
  try {
    const filePath = req.params[0];
    const fullPath = path.join(__dirname, 'uploads', filePath);
    
    // Security: prevent directory traversal
    const normalizedPath = path.normalize(fullPath);
    const uploadsDir = path.normalize(path.join(__dirname, 'uploads'));
    
    if (!normalizedPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Determine content type
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }[ext] || 'application/octet-stream';
    
    res.setHeader('Content-Type', contentType);
    res.sendFile(fullPath);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('\n❌ Cannot start server without database connection');
      console.error('📌 Please check your database configuration in .env file\n');
      process.exit(1);
    }

    // Sync database (create tables if not exist)
    console.log('🔄 Syncing database...');
    await syncDatabase(false); // false = tidak drop existing tables
    
    // Start listening
    app.listen(PORT, () => {
      console.log('\n✅ Server is running!');
      console.log(`📍 Local:            http://localhost:${PORT}`);
      console.log(`🌍 Network:         http://0.0.0.0:${PORT}`);
      console.log(`📝 Environment:     ${process.env.NODE_ENV || 'development'}`);
      console.log(`💾 Database:        PostgreSQL (${process.env.DB_NAME})`);
      console.log(`\n📚 API Documentation:`);
      console.log(`   - Auth:          http://localhost:${PORT}/api/auth`);
      console.log(`   - Positions:     http://localhost:${PORT}/api/positions`);
      console.log(`   - Applications:  http://localhost:${PORT}/api/applications`);
      console.log(`   - Chat (Gemini): http://localhost:${PORT}/api/chat`);
      console.log(`\n🚀 Ready to accept requests!\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();
