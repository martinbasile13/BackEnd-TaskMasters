// TaskMasters - Rutas de categorías (MINIMALISTA)
const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Todas las rutas de categorías requieren autenticación
router.use(authenticateToken);

// POST /api/categories - Crear nueva categoría
router.post('/', [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)')
], categoryController.createCategory);

// GET /api/categories - Obtener todas las categorías del usuario
router.get('/', categoryController.getCategories);

// POST /api/categories/defaults - Crear categorías por defecto
router.post('/defaults', categoryController.createDefaultCategories);

// GET /api/categories/:id - Obtener categoría por ID
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido')
], categoryController.getCategory);

// PUT /api/categories/:id - Actualizar categoría
router.put('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido'),
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('El color debe ser un código hexadecimal válido (ej: #FF0000)')
], categoryController.updateCategory);

// DELETE /api/categories/:id - Eliminar categoría
router.delete('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido')
], categoryController.deleteCategory);

// GET /api/categories/:id/tasks - Obtener tareas de una categoría
router.get('/:id/tasks', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido')
], categoryController.getCategoryTasks);

module.exports = router;
