const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a folder name'],
    trim: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: 'Folder',
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  path: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
folderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for faster queries
folderSchema.index({ user: 1, parent: 1 });
folderSchema.index({ name: 'text' });

// Virtual populate files
folderSchema.virtual('files', {
  ref: 'File',
  localField: '_id',
  foreignField: 'folder'
});

// Virtual populate subfolders
folderSchema.virtual('subfolders', {
  ref: 'Folder',
  localField: '_id',
  foreignField: 'parent'
});

// Enable virtuals in JSON
folderSchema.set('toJSON', { virtuals: true });
folderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Folder', folderSchema); 