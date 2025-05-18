const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { upload, checkStorageLimit } = require('../middlewares/upload.middleware');
const {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  toggleFavorite,
  getFavorites,
  getFilesByDate
} = require('../controllers/file.controller');

// Protected routes
router.use(auth);

// File routes
router.route('/')
  .get(getFiles)
  .post(upload.single('file'), checkStorageLimit, uploadFile);

router.route('/favorites')
  .get(getFavorites);

router.route('/by-date')
  .get(getFilesByDate);

router.route('/:id')
  .get(getFile)
  .put(updateFile)
  .delete(deleteFile);

router.route('/:id/favorite')
  .post(toggleFavorite);

module.exports = router; 