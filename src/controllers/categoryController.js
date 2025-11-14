// TaskMasters - Controlador de categorías (Organización total)
const { validationResult } = require('express-validator');
const categoryService = require('../services/categoryService');

const categoryController = {
  // Crear una nueva categoría para organizar tareas
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const category = await categoryService.createCategory(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Categoría creada correctamente',
        data: category
      });
      
    } catch (error) {
      console.error('Error creando categoría:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtener todas las categorías del usuario
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getUserCategories(req.user.id);
      
      res.json({
        success: true,
        message: 'Categorías obtenidas correctamente',
        data: categories
      });
      
    } catch (error) {
      console.error('Error obteniendo categorías:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener categoría por ID
  async getCategory(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id, req.user.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no se encontró esa categoría'
        });
      }
      
      res.json({
        success: true,
        message: 'Categoría obtenida correctamente',
        data: category
      });
      
    } catch (error) {
      console.error('Error obteniendo categoría:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar categoría
  async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Los datos no están bien',
          errors: errors.array()
        });
      }

      const category = await categoryService.updateCategory(req.params.id, req.body, req.user.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no se encontró esa categoría'
        });
      }
      
      res.json({
        success: true,
        message: 'Categoría actualizada correctamente',
        data: category
      });
      
    } catch (error) {
      console.error('Error actualizando categoría:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar categoría
  async deleteCategory(req, res) {
    try {
      const deleted = await categoryService.deleteCategory(req.params.id, req.user.id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no se encontró esa categoría'
        });
      }
      
      res.json({
        success: true,
        message: 'Categoría eliminada correctamente'
      });
      
    } catch (error) {
      console.error('Error eliminando categoría:', error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Obtener tareas de una categoría
  async getCategoryTasks(req, res) {
    try {
      const tasks = await categoryService.getTasksByCategory(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Tareas de la categoría obtenidas correctamente',
        data: tasks
      });
      
    } catch (error) {
      console.error('Error obteniendo tareas de categoría:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear categorías por defecto
  async createDefaultCategories(req, res) {
    try {
      const categories = await categoryService.createDefaultCategories(req.user.id);
      
      res.json({
        success: true,
        message: 'Categorías por defecto creadas correctamente',
        data: categories
      });
      
    } catch (error) {
      console.error('Error creando categorías por defecto:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = categoryController;
