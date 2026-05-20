const express = require('express');
const router = express.Router();
const interaccionesController = require('../controllers/interaccionesController');

// POST /api/interacciones - Registrar nueva interacción (LIKE/DISLIKE)
router.post('/', interaccionesController.registrarInteraccion);

// GET /api/interacciones/:usuario_id - Obtener las prendas guardadas/descartadas
router.get('/:usuario_id', interaccionesController.obtenerInteracciones);

// DELETE /api/interacciones/:interaccion_id - Eliminar interacción y devolver al feed
router.delete('/:interaccion_id', interaccionesController.eliminarInteraccion);

module.exports = router;
