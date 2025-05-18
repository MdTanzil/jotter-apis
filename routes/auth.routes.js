const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  deleteAccount
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.use(auth);
router.post('/logout', logout);
router.delete('/account/delete', deleteAccount);

module.exports = router; 