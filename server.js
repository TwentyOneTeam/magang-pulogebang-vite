import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// SPA fallback - serve index.html for all routes that don't match static files
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n✅ Frontend server is running!');
  console.log(`📍 Local:        http://localhost:${PORT}`);
  console.log(`🌍 Network:     http://0.0.0.0:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🚀 Ready to serve frontend!\n`);
});
