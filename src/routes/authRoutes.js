// TaskMasters - Rutas de autenticación (MINIMALISTA)
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// POST /api/auth/register - Registrar usuario
router.post('/register', [
  // Validaciones simples
  body('email')
    .isEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres')
], authController.register);

// POST /api/auth/login - Login de usuario
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
], authController.login);

// GET /api/auth/profile - Obtener perfil (protegido)
router.get('/profile', authenticateToken, authController.getProfile);

// GET /api/auth/verify/:token - Verificar email
router.get('/verify/:token', authController.verifyEmail);

// GET /api/auth/users - Obtener todos los usuarios (para testing)
router.get('/users', authController.getUsers);

module.exports = router;
