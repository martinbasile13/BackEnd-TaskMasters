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
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });

  // Manejo adecuado de señales para shutdown graceful
  const gracefulShutdown = (signal) => {
    console.log(`\n📡 Recibida señal ${signal}. Cerrando servidor...`);
    
    server.close((err) => {
      console.log('🛑 Servidor cerrado correctamente');
      
      if (err) {
        console.error('❌ Error al cerrar el servidor:', err);
        process.exit(1);
      }
      
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.log('⚠️  Forzando cierre del servidor...');
      process.exit(1);
    }, 10000);
  };

  // Escuchar señales de cierre
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer();
