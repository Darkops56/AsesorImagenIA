const express = require('express');
const router = express.Router();
const Prenda = require('../models/Prenda');

// GET /api/prendas - Recuperar todas las prendas
router.get('/', async (req, res) => {
  try {
    const { silueta } = req.query;
    let query = {};

    if (silueta) {
      // Case-insensitive match for the specific silueta and 'Universal' items
      const siluetaRegex = new RegExp(`^${silueta}$`, 'i');
      const universalRegex = new RegExp('^universal$', 'i');
      query = { tags_compatibilidad: { $in: [siluetaRegex, universalRegex] } };
    }

    const prendas = await Prenda.find(query);
    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error al obtener las prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor al recuperar prendas.' });
  }
});

module.exports = router;
