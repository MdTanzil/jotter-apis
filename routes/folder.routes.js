const express = require('express');
const router = express.Router();
const {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder
} = require('../controllers/folder.controller');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router
  .route('/')
  .get(getFolders)
  .post(createFolder);

router
  .route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(deleteFolder);

module.exports = router; 