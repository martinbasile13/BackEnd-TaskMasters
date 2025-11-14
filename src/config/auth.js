// TaskMasters - Middleware JWT (MINIMALISTA)
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obtener usuario
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Agregar usuario al request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = { authenticateToken };
