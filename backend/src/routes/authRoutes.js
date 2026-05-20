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
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await require('../models/Usuario').findById(req.user._id).select('-password_hash');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al recuperar usuario' });
  }
});
router.put('/profile', authMiddleware, updateProfile);
router.put('/security', authMiddleware, updateSecurityInfo);

module.exports = router;
