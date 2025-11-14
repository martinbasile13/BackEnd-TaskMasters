// TaskMasters - Servicio de tareas (Simple y al grano)
const { pool } = require('../config/database');

const taskService = {
  // Crear una nueva tarea para el usuario
  async createTask(taskData, userId) {
    const { title, description, category_id } = taskData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO tasks (title, description, category_id, user_id) VALUES (?, ?, ?, ?)',
        [title, description || null, category_id || null, userId]
      );
      
      return {
        id: result.insertId,
        title,
        description,
        category_id,
        user_id: userId,
        is_completed: false
      };
    } catch (error) {
      throw error;
    }
  },

  // Traer todas las tareas del usuario autenticado
  async getUserTasks(userId) {
    const [rows] = await pool.execute(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId]);
    
    return rows;
  },

  // Obtener una tarea específica por ID (verificando propietario)
  async getTaskById(taskId, userId) {
    const [rows] = await pool.execute(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM tasks t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?
    `, [taskId, userId]);
    
    return rows[0];
  },

  // Actualizar los datos de una tarea existente
  async updateTask(taskId, taskData, userId) {
    const { title, description, category_id } = taskData;
    
    await pool.execute(
      'UPDATE tasks SET title = ?, description = ?, category_id = ? WHERE id = ? AND user_id = ?',
      [title, description || null, category_id || null, taskId, userId]
    );
    
    return await this.getTaskById(taskId, userId);
  },

  // Cambiar el estado de completado de una tarea
  async toggleTaskCompletion(taskId, userId) {
    // Traer el estado actual de la tarea
    const task = await this.getTaskById(taskId, userId);
    if (!task) {
      throw new Error('No se encontró la tarea che');
    }

    const newStatus = !task.is_completed;
    const completedAt = newStatus ? new Date() : null;

    await pool.execute(
      'UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      [newStatus, completedAt, taskId, userId]
    );

    return await this.getTaskById(taskId, userId);
  },

  // Eliminar una tarea de forma permanente
  async deleteTask(taskId, userId) {
    const result = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );
    
    return result[0].affectedRows > 0;
  },

  // Obtener las estadísticas de tareas del usuario
  async getTaskStats(userId) {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) as pending_tasks
      FROM tasks 
      WHERE user_id = ?
    `, [userId]);
    
    return rows[0];
  }
};

module.exports = taskService;
