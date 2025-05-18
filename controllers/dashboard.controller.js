const File = require('../models/file.model');
const User = require('../models/user.model');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get user with storage info
    const user = await User.findById(req.user.id);

    // Get file counts by type
    const [imageCount, pdfCount, noteCount] = await Promise.all([
      File.countDocuments({
        user: req.user.id,
        mimeType: { $regex: '^image/' }
      }),
      File.countDocuments({
        user: req.user.id,
        mimeType: 'application/pdf'
      }),
      File.countDocuments({
        user: req.user.id,
        mimeType: { $in: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
      })
    ]);

    // Get recent files
    const recentFiles = await File.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name originalName mimeType createdAt');

    // Calculate storage metrics
    const storageMetrics = {
      total: user.storageLimit,
      used: user.storageUsed,
      available: user.storageLimit - user.storageUsed,
      usedPercentage: ((user.storageUsed / user.storageLimit) * 100).toFixed(2)
    };

    // Format response to match the UI structure
    const response = {
      storage: {
        total: `${(storageMetrics.total / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        used: `${(storageMetrics.used / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        available: `${(storageMetrics.available / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        usedPercentage: parseFloat(storageMetrics.usedPercentage)
      },
      fileTypes: {
        images: {
          count: imageCount,
          totalSize: await getFilesSize(req.user.id, '^image/')
        },
        pdf: {
          count: pdfCount,
          totalSize: await getFilesSize(req.user.id, 'application/pdf')
        },
        notes: {
          count: noteCount,
          totalSize: await getFilesSize(req.user.id, ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
        }
      },
      recentFiles
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to get total size of files by type
const getFilesSize = async (userId, mimeType) => {
  const files = await File.find({
    user: userId,
    mimeType: Array.isArray(mimeType) ? { $in: mimeType } : { $regex: mimeType }
  });

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
}; 