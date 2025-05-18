const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  downloadFile
} = require('../controllers/file.controller');
const { protect } = require('../middlewares/auth.middleware');
const { upload, checkStorageLimit } = require('../middlewares/upload.middleware');

router.use(protect);

router
  .route('/')
  .get(getFiles)
  .post(checkStorageLimit, upload.single('file'), uploadFile);

router
  .route('/:id')
  .get(getFile)
  .put(updateFile)
  .delete(deleteFile);

router.get('/:id/download', downloadFile);

module.exports = router; 