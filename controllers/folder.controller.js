const Folder = require('../models/folder.model');
const File = require('../models/file.model');
const fs = require('fs');
const path = require('path');

// @desc    Create folder
// @route   POST /api/folders
// @access  Private
exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    // Create folder path
    let folderPath = path.join('uploads', req.user.id.toString(), name);
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
      folderPath = path.join(parentFolder.path, name);
    }

    // Create folder in filesystem
    fs.mkdirSync(folderPath, { recursive: true });

    const folder = await Folder.create({
      name,
      user: req.user.id,
      parent: parentId || null,
      path: folderPath
    });

    res.status(201).json({
      success: true,
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all folders
// @route   GET /api/folders
// @access  Private
exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({
      user: req.user.id,
      parent: req.query.parentId || null
    }).populate('files subfolders');

    res.status(200).json({
      success: true,
      count: folders.length,
      data: folders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single folder
// @route   GET /api/folders/:id
// @access  Private
exports.getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id)
      .populate('files subfolders');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Make sure user owns folder
    if (folder.user.toString() !== req.user.id && !folder.isPublic) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this folder'
      });
    }

    res.status(200).json({
      success: true,
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Private
exports.updateFolder = async (req, res, next) => {
  try {
    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Make sure user owns folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this folder'
      });
    }

    // If name is being updated, update the path
    if (req.body.name && req.body.name !== folder.name) {
      const oldPath = folder.path;
      const newPath = path.join(path.dirname(folder.path), req.body.name);
      
      // Rename folder in filesystem
      fs.renameSync(oldPath, newPath);
      
      // Update folder path and all contained files and subfolders
      await updatePathsRecursively(folder._id, oldPath, newPath);
    }

    folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { 
        name: req.body.name || folder.name,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : folder.isPublic
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: folder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Private
exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Make sure user owns folder
    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this folder'
      });
    }

    // Delete folder and contents recursively
    await deleteFolderRecursively(folder._id);

    // Delete folder from filesystem
    fs.rmdirSync(folder.path, { recursive: true });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update paths recursively when a folder is renamed
const updatePathsRecursively = async (folderId, oldPath, newPath) => {
  // Update folder path
  await Folder.findByIdAndUpdate(folderId, { path: newPath });

  // Update paths of all files in the folder
  await File.updateMany(
    { folder: folderId },
    { $set: { path: function(doc) {
      return doc.path.replace(oldPath, newPath);
    }}}
  );

  // Update paths of all subfolders recursively
  const subfolders = await Folder.find({ parent: folderId });
  for (const subfolder of subfolders) {
    const newSubfolderPath = subfolder.path.replace(oldPath, newPath);
    await updatePathsRecursively(subfolder._id, subfolder.path, newSubfolderPath);
  }
};

// Helper function to delete folder contents recursively
const deleteFolderRecursively = async (folderId) => {
  // Delete all files in the folder
  const files = await File.find({ folder: folderId });
  for (const file of files) {
    fs.unlinkSync(file.path);
    await file.remove();
  }

  // Delete all subfolders recursively
  const subfolders = await Folder.find({ parent: folderId });
  for (const subfolder of subfolders) {
    await deleteFolderRecursively(subfolder._id);
  }

  // Delete the folder itself
  await Folder.findByIdAndDelete(folderId);
}; 