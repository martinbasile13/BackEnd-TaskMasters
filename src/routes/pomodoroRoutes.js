// TaskMasters - Rutas de pomodoros (MINIMALISTA)
const express = require('express');
const { body, param, query } = require('express-validator');
const pomodoroController = require('../controllers/pomodoroController');
const { authenticateToken } = require('../config/auth');

const router = express.Router();

// Todas las rutas de pomodoros requieren autenticación
router.use(authenticateToken);

// POST /api/pomodoros - Registrar pomodoro completado
router.post('/', [
  body('task_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de tarea debe ser un número válido')
], pomodoroController.addPomodoro);

// GET /api/pomodoros/today - Obtener pomodoros y estadísticas de hoy
router.get('/today', pomodoroController.getTodayData);

// GET /api/pomodoros/week - Obtener estadísticas de la semana
router.get('/week', pomodoroController.getWeekStats);

// GET /api/pomodoros/stats - Obtener estadísticas generales
router.get('/stats', pomodoroController.getGeneralStats);

// GET /api/pomodoros/range - Obtener pomodoros por rango de fechas
router.get('/range', [
  query('startDate')
    .notEmpty()
    .withMessage('startDate es requerido')
    .isISO8601()
    .withMessage('startDate debe ser una fecha válida (YYYY-MM-DD)'),
  query('endDate')
    .notEmpty()
    .withMessage('endDate es requerido')
    .isISO8601()
    .withMessage('endDate debe ser una fecha válida (YYYY-MM-DD)')
], pomodoroController.getPomodorosByRange);

// PUT /api/pomodoros/goal - Actualizar objetivo de pomodoros
router.put('/goal', [
  body('goal')
    .isInt({ min: 1, max: 20 })
    .withMessage('El objetivo debe ser un número entre 1 y 20')
], pomodoroController.updateGoal);

// DELETE /api/pomodoros/:id - Eliminar pomodoro
router.delete('/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de pomodoro debe ser un número válido')
], pomodoroController.deletePomodoro);

module.exports = router;
