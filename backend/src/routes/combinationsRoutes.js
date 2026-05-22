const express = require('express');
const router = express.Router();
const combinationsController = require('../controllers/combinationsController');

// Generar combinaciones para un usuario
router.post('/generate', combinationsController.generateCombinations);

// Obtener todas las combinaciones de un usuario
router.get('/:usuario_id', combinationsController.getCombinations);

// Eliminar una combinación específica
router.delete('/:id', combinationsController.deleteCombination);

module.exports = router;
