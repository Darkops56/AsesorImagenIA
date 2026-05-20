const express = require('express');
const router = express.Router();
const {
  register,
  login,
  updateProfile,
  updateSecurityInfo
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.put('/profile', authMiddleware, updateProfile);
router.put('/security', authMiddleware, updateSecurityInfo);

module.exports = router;
