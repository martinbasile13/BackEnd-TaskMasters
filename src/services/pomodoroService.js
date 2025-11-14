// TaskMasters - Servicio de pomodoros (Enfoque y productividad)
const { pool } = require('../config/database');

const pomodoroService = {
  // Registrar un ciclo de pomodoro completado
  async addPomodoro(userId, taskId = null) {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const [result] = await pool.execute(
        'INSERT INTO pomodoros (user_id, task_id, date) VALUES (?, ?, ?)',
        [userId, taskId, today]
      );
      
      return {
        id: result.insertId,
        user_id: userId,
        task_id: taskId,
        date: today,
        completed_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  },

  // Traer todos los pomodoros del día de hoy
  async getTodayPomodoros(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const [rows] = await pool.execute(`
      SELECT p.*, t.title as task_title, t.id as task_id
      FROM pomodoros p
      LEFT JOIN tasks t ON p.task_id = t.id
      WHERE p.user_id = ? AND p.date = ?
      ORDER BY p.completed_at DESC
    `, [userId, today]);
    
    return rows;
  },

  // Obtener las estadísticas del día actual
  async getTodayStats(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Traer el objetivo diario del usuario
    const [userRows] = await pool.execute(
      'SELECT pomodoro_goal FROM users WHERE id = ?',
      [userId]
    );
    
    const goal = userRows[0]?.pomodoro_goal || 6;
    
    // Contar cuántos pomodoros completó hoy
    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as completed FROM pomodoros WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    
    const completed = countRows[0].completed;
    
    return {
      completed,
      goal,
      remaining: Math.max(0, goal - completed),
      percentage: Math.round((completed / goal) * 100)
    };
  },

  // Obtener pomodoros en un rango de fechas específico
  async getPomodorosByDateRange(userId, startDate, endDate) {
    const [rows] = await pool.execute(`
      SELECT 
        DATE(p.date) as date,
        COUNT(*) as count,
        u.pomodoro_goal as goal
      FROM pomodoros p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.date BETWEEN ? AND ?
      GROUP BY DATE(p.date), u.pomodoro_goal
      ORDER BY p.date DESC
    `, [userId, startDate, endDate]);
    
    return rows;
  },

  // Obtener estadísticas de la semana en curso
  async getWeekStats(userId) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    
    const startDate = startOfWeek.toISOString().split('T')[0];
    const endDate = endOfWeek.toISOString().split('T')[0];
    
    return await this.getPomodorosByDateRange(userId, startDate, endDate);
  },

  // Eliminar un pomodoro (por si se cargó mal)
  async deletePomodoro(pomodoroId, userId) {
    const result = await pool.execute(
      'DELETE FROM pomodoros WHERE id = ? AND user_id = ?',
      [pomodoroId, userId]
    );
    
    return result[0].affectedRows > 0;
  },

  // Cambiar el objetivo diario de pomodoros del usuario
  async updatePomodoroGoal(userId, newGoal) {
    await pool.execute(
      'UPDATE users SET pomodoro_goal = ? WHERE id = ?',
      [newGoal, userId]
    );
    
    return { goal: newGoal };
  },

  // Obtener estadísticas generales de productividad
  async getGeneralStats(userId) {
    // Total de pomodoros completados
    const [totalRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM pomodoros WHERE user_id = ?',
      [userId]
    );
    
    // Promedio diario de los últimos 7 días
    const [avgRows] = await pool.execute(`
      SELECT AVG(daily_count) as average
      FROM (
        SELECT DATE(date) as day, COUNT(*) as daily_count
        FROM pomodoros 
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(date)
      ) as daily_stats
    `, [userId]);
    
    // Mejor día registrado (máxima cantidad)
    const [bestRows] = await pool.execute(`
      SELECT DATE(date) as best_date, COUNT(*) as max_count
      FROM pomodoros 
      WHERE user_id = ?
      GROUP BY DATE(date)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, [userId]);
    
    return {
      total: totalRows[0].total,
      dailyAverage: Math.round(avgRows[0].average || 0),
      bestDay: bestRows[0] || null
    };
  }
};

module.exports = pomodoroService;
