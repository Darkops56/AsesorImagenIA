const express = require('express');
const router = express.Router();
const Prenda = require('../models/Prenda');

// GET /api/prendas - Recuperar todas las prendas
router.get('/', async (req, res) => {
  try {
    const prendas = await Prenda.find();
    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error al obtener las prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor al recuperar prendas.' });
  }
});

module.exports = router;
