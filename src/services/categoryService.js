// TaskMasters - Servicio de categorías (Organización total)
const { pool } = require('../config/database');

const categoryService = {
  // Crear una nueva categoría para organizar las tareas
  async createCategory(categoryData, userId) {
    const { name, color } = categoryData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
        [name, color || '#3B82F6', userId]
      );
      
      return {
        id: result.insertId,
        name,
        color: color || '#3B82F6',
        user_id: userId
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ya tenés una categoría con ese nombre papá');
      }
      throw error;
    }
  },

  // Traer todas las categorías del usuario con su conteo de tareas
  async getUserCategories(userId) {
    const [rows] = await pool.execute(`
      SELECT c.*, COUNT(t.id) as task_count
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = c.user_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `, [userId]);
    
    return rows;
  },

  // Buscar una categoría específica por ID (verificando propietario)
  async getCategoryById(categoryId, userId) {
    const [rows] = await pool.execute(`
      SELECT c.*, COUNT(t.id) as task_count
      FROM categories c
      LEFT JOIN tasks t ON c.id = t.category_id AND t.user_id = c.user_id
      WHERE c.id = ? AND c.user_id = ?
      GROUP BY c.id
    `, [categoryId, userId]);
    
    return rows[0];
  },

  // Actualizar el nombre y color de una categoría
  async updateCategory(categoryId, categoryData, userId) {
    const { name, color } = categoryData;
    
    await pool.execute(
      'UPDATE categories SET name = ?, color = ? WHERE id = ? AND user_id = ?',
      [name, color, categoryId, userId]
    );
    
    return await this.getCategoryById(categoryId, userId);
  },

  // Eliminar una categoría (solo si no tiene tareas)
  async deleteCategory(categoryId, userId) {
    // Verificar que no tenga tareas asociadas
    const category = await this.getCategoryById(categoryId, userId);
    if (!category) {
      throw new Error('No se encontró esa categoría');
    }

    if (category.task_count > 0) {
      throw new Error('No podés borrar una categoría que tiene tareas asignadas');
    }

    const result = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, userId]
    );
    
    return result[0].affectedRows > 0;
  },

  // Traer todas las tareas que pertenecen a una categoría
  async getTasksByCategory(categoryId, userId) {
    const [rows] = await pool.execute(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM tasks t
      JOIN categories c ON t.category_id = c.id
      WHERE t.category_id = ? AND t.user_id = ?
      ORDER BY t.created_at DESC
    `, [categoryId, userId]);
    
    return rows;
  },

  // Crear las categorías básicas cuando se registra un usuario
  async createDefaultCategories(userId) {
    const defaultCategories = [
      { name: 'Personal', color: '#10B981' },
      { name: 'Trabajo', color: '#3B82F6' },
      { name: 'Estudio', color: '#8B5CF6' },
      { name: 'Urgente', color: '#EF4444' }
    ];

    const createdCategories = [];
    
    for (const category of defaultCategories) {
      try {
        const created = await this.createCategory(category, userId);
        createdCategories.push(created);
      } catch (error) {
        // No hacer nada si ya existen
        console.log(`La categoría ${category.name} ya existe para el usuario ${userId}`);
      }
    }
    
    return createdCategories;
  }
};

module.exports = categoryService;
