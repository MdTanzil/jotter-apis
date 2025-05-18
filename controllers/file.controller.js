const File = require('../models/file.model');
const User = require('../models/user.model');
const fs = require('fs');
const path = require('path');

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const file = await File.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      user: req.user.id,
      folder: req.body.folderId || null
    });

    // Update user's storage used
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: req.file.size }
    });

    res.status(201).json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all files
// @route   GET /api/files
// @access  Private
exports.getFiles = async (req, res, next) => {
  try {
    const files = await File.find({ user: req.user.id, folder: req.query.folderId || null });

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
exports.getFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Make sure user owns file
    if (file.user.toString() !== req.user.id && !file.isPublic) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Make sure user owns file
    if (file.user.toString() !== req.user.id && !file.isPublic) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    res.download(file.path, file.originalName);
  } catch (error) {
    next(error);
  }
};

// @desc    Update file
// @route   PUT /api/files/:id
// @access  Private
exports.updateFile = async (req, res, next) => {
  try {
    let file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Make sure user owns file
    if (file.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this file'
      });
    }

    file = await File.findByIdAndUpdate(
      req.params.id,
      { 
        name: req.body.name || file.name,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : file.isPublic,
        folder: req.body.folderId || file.folder
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Make sure user owns file
    if (file.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from storage
    fs.unlink(file.path, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }

      // Update user's storage used
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { storageUsed: -file.size }
      });

      // Delete file from database
      await file.remove();

      res.status(200).json({
        success: true,
        data: {}
      });
    });
  } catch (error) {
    next(error);
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    file.isFavorite = !file.isFavorite;
    await file.save();

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite status',
      error: error.message
    });
  }
};

// Get all favorite files
exports.getFavorites = async (req, res) => {
  try {
    const files = await File.find({ 
      user: req.user.id,
      isFavorite: true 
    }).sort('-createdAt');

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching favorite files',
      error: error.message
    });
  }
};

// Get files by date
exports.getFilesByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const files = await File.find({
      user: req.user.id,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort('-createdAt');

    res.json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching files by date',
      error: error.message
    });
  }
}; 