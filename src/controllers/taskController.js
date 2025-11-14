// TaskMasters - Controlador de tareas (Gestión simple y efectiva)
const { validationResult } = require('express-validator');
const taskService = require('../services/taskService');

const taskController = {
  // Crear una nueva tarea
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const task = await taskService.createTask(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Tarea creada correctamente',
        data: task
      });
      
    } catch (error) {
      console.error('Error creando tarea:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Traer todas las tareas del usuario autenticado
  async getTasks(req, res) {
    try {
      const tasks = await taskService.getUserTasks(req.user.id);
      const stats = await taskService.getTaskStats(req.user.id);
      
      res.json({
        success: true,
        message: 'Tareas obtenidas correctamente',
        data: {
          tasks,
          stats
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo tareas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Traer una tarea específica por su ID
  async getTask(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id, req.user.id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró esa tarea'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea obtenida correctamente',
        data: task
      });
      
    } catch (error) {
      console.error('Error obteniendo tarea:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar los datos de una tarea
  async updateTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró esa tarea'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea actualizada correctamente',
        data: task
      });
      
    } catch (error) {
      console.error('Error actualizando tarea:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Cambiar el estado de completado de una tarea
  async toggleTask(req, res) {
    try {
      const task = await taskService.toggleTaskCompletion(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: `Tarea marcada como ${task.is_completed ? 'completada' : 'pendiente'}`,
        data: task
      });
      
    } catch (error) {
      console.error('Error cambiando estado de tarea:', error.message);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  // Eliminar una tarea permanentemente
  async deleteTask(req, res) {
    try {
      const deleted = await taskService.deleteTask(req.params.id, req.user.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró esa tarea'
        });
      }
      
      res.json({
        success: true,
        message: 'Tarea eliminada correctamente'
      });
      
    } catch (error) {
      console.error('Error eliminando tarea:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = taskController;
