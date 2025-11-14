// TaskMasters - Rutas de tareas (MINIMALISTA)
const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Todas las rutas de tareas requieren autenticación
router.use(authenticateToken);

// POST /api/tasks - Crear nueva tarea
router.post('/', [
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El título debe tener entre 1 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido')
], taskController.createTask);

// GET /api/tasks - Obtener todas las tareas del usuario
router.get('/', taskController.getTasks);

// GET /api/tasks/:id - Obtener tarea por ID
router.get('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de tarea debe ser un número válido')
], taskController.getTask);

// PUT /api/tasks/:id - Actualizar tarea
router.put('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de tarea debe ser un número válido'),
  body('title')
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El título debe tener entre 1 y 255 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría debe ser un número válido')
], taskController.updateTask);

// PATCH /api/tasks/:id/toggle - Marcar como completada/pendiente
router.patch('/:id/toggle', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de tarea debe ser un número válido')
], taskController.toggleTask);

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de tarea debe ser un número válido')
], taskController.deleteTask);

module.exports = router;
