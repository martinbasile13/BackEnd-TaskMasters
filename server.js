// TaskMasters Backend - Servidor principal (MINIMALISTA)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const pomodoroRoutes = require('./src/routes/pomodoroRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pomodoros', pomodoroRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'TaskMasters API funcionando! 🚀',
    version: '1.0.0'
  });
});

// Iniciar servidor
const startServer = async () => {
  // Probar conexión a la base de datos
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
