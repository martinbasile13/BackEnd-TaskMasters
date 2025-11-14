// TaskMasters - Controlador de autenticación (Seguridad y acceso)
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const authController = {
  // Registrar un nuevo usuario en el sistema
  async register(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      // Crear el usuario
      const user = await userService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: user
      });
      
    } catch (error) {
      console.error('Error en registro:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Iniciar sesión con email y contraseña
  async login(req, res) {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar el usuario por email
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }

      // Verificar que la contraseña coincida
      const isValidPassword = await userService.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email o contraseña incorrectos'
        });
      }

      // Generar el token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Sesión iniciada correctamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            is_verified: user.is_verified,
            pomodoro_goal: user.pomodoro_goal
          },
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener el perfil del usuario autenticado
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        message: 'Perfil obtenido correctamente',
        data: req.user
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Verificar el email del usuario
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await userService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verificado correctamente',
        data: user
      });

    } catch (error) {
      console.error('Error verificando email:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtener todos los usuarios (para testing de la API)
  async getUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      
      res.json({
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: users,
        total: users.length
      });
      
    } catch (error) {
      console.error('Error obteniendo usuarios:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;
