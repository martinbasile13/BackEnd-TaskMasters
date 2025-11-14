// TaskMasters - Controlador de pomodoros (Enfoque y productividad)
const { validationResult } = require('express-validator');
const pomodoroService = require('../services/pomodoroService');

const pomodoroController = {
  // Registrar un pomodoro completado
  async addPomodoro(req, res) {
    try {
      const { task_id } = req.body;
      
      const pomodoro = await pomodoroService.addPomodoro(req.user.id, task_id);
      const stats = await pomodoroService.getTodayStats(req.user.id);
      
      res.status(201).json({
        success: true,
        message: '¡Pomodoro completado! 🍅',
        data: {
          pomodoro,
          todayStats: stats
        }
      });
      
    } catch (error) {
      console.error('Error registrando pomodoro:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener pomodoros y estadísticas de hoy
  async getTodayData(req, res) {
    try {
      const pomodoros = await pomodoroService.getTodayPomodoros(req.user.id);
      const stats = await pomodoroService.getTodayStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Datos de hoy obtenidos correctamente',
        data: {
          pomodoros,
          stats
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo datos de hoy:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas de la semana
  async getWeekStats(req, res) {
    try {
      const weekStats = await pomodoroService.getWeekStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Estadísticas de la semana obtenidas correctamente',
        data: weekStats
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas de semana:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener estadísticas generales
  async getGeneralStats(req, res) {
    try {
      const generalStats = await pomodoroService.getGeneralStats(req.user.id);
      const todayStats = await pomodoroService.getTodayStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Estadísticas generales obtenidas correctamente',
        data: {
          general: generalStats,
          today: todayStats
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar objetivo de pomodoros
  async updateGoal(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const { goal } = req.body;
      const result = await pomodoroService.updatePomodoroGoal(req.user.id, goal);
      const newStats = await pomodoroService.getTodayStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Objetivo actualizado correctamente',
        data: {
          goal: result.goal,
          todayStats: newStats
        }
      });
      
    } catch (error) {
      console.error('Error actualizando objetivo:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar pomodoro
  async deletePomodoro(req, res) {
    try {
      const deleted = await pomodoroService.deletePomodoro(req.params.id, req.user.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Pomodoro no encontrado'
        });
      }
      
      const stats = await pomodoroService.getTodayStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Pomodoro eliminado correctamente',
        data: {
          todayStats: stats
        }
      });
      
    } catch (error) {
      console.error('Error eliminando pomodoro:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener pomodoros por rango de fechas
  async getPomodorosByRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate y endDate son requeridos'
        });
      }
      
      const pomodoros = await pomodoroService.getPomodorosByDateRange(
        req.user.id, 
        startDate, 
        endDate
      );
      
      res.json({
        success: true,
        message: 'Pomodoros por rango obtenidos correctamente',
        data: pomodoros
      });
      
    } catch (error) {
      console.error('Error obteniendo pomodoros por rango:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = pomodoroController;
