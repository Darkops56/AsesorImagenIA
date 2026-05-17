const express = require('express');
const router = express.Router();
const { evaluarMorfologia } = require('../controllers/morphologyController');

// POST /api/morphology/calculate
router.post('/calculate', evaluarMorfologia);

module.exports = router;
