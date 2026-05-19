require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const morphologyRoutes = require('./routes/morphologyRoutes');
const prendasRoutes = require('./routes/prendasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a Base de Datos (Opcional comentarla si aún no tienes MongoDB corriendo local)
connectDB();

// Rutas base
app.use('/api/morphology', morphologyRoutes);
app.use('/api/prendas', prendasRoutes);

// Endpoint de prueba Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
