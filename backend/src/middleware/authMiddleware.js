require('dotenv').config();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No hay token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    const user = await Usuario.findById(decoded.id).select('-password_hash');
    
    if (!user) {
      return res.status(401).json({ message: 'Token no válido o usuario no existe.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de auth:', error);
    res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = authMiddleware;
