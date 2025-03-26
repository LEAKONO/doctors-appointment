const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create nested uploads directory structure
const uploadsBaseDir = path.join(__dirname, 'uploads');
const uploadsProfileDir = path.join(uploadsBaseDir, 'profiles');

// Ensure directories exist
[uploadsBaseDir, uploadsProfileDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Serve static files with improved caching
app.use('/uploads', express.static(uploadsBaseDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath);
    const cacheTime = ext.match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'public, max-age=31536000' : 'public, max-age=86400';
    res.set('Cache-Control', cacheTime);
  }
}));

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));

// Improved error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'File too large',
      message: 'Maximum file size is 5MB'
    });
  }
  
  if (err.message.includes('image files')) {
    return res.status(415).json({
      error: 'Unsupported media type',
      message: 'Only image files are allowed'
    });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Upload directory: ${uploadsBaseDir}`);
});