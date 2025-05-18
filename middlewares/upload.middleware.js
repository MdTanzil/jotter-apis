const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept all file types for now
    // You can add file type restrictions here if needed
    cb(null, true);
};

// Create multer instance
const multerUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
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
    upload: multerUpload,
    checkStorageLimit
}; 