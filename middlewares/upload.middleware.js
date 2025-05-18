const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) // Max file size in bytes
  }
});

// Middleware to check user storage limit
const checkStorageLimit = async (req, res, next) => {
  try {
    const fileSize = parseInt(req.headers['content-length']);
    const user = req.user;

    if (user.storageUsed + fileSize > user.storageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Storage limit exceeded'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  checkStorageLimit
}; 