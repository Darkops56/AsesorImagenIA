const express = require('express');
const router = express.Router();
const combinationsController = require('../controllers/combinationsController');

// Generar combinaciones para un usuario
router.post('/generate', combinationsController.generateCombinations);

// Obtener combinaciones de un usuario (dividido en IA y manuales)
router.get('/:usuario_id', combinationsController.getCombinations);

// Eliminar una combinación específica
router.delete('/:id', combinationsController.deleteCombination);

// Crear combinación manualmente
router.post('/manual', combinationsController.createManualCombination);

// Forzar generación de una nueva sugerencia IA
router.post('/generate-suggestion', combinationsController.generateSingleSuggestion);

// Guardar sugerencia IA como look permanente
router.post('/save-suggestion/:id', combinationsController.saveSuggestion);

module.exports = router;
