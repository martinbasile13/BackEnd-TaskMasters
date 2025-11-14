// TaskMasters - Servicio de usuarios (Simple pero efectivo)
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const userService = {
  // Registrar un nuevo usuario en el sistema
  async createUser(userData) {
    const { email, password, name } = userData;
    
    try {
      // Hashear la contraseña para mayor seguridad
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Guardar el usuario en la base de datos
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, hashedPassword, name]
      );
      
      return {
        id: result.insertId,
        email,
        name
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Ese email ya está en uso, probá con otro');
      }
      throw error;
    }
  },

  // Buscar un usuario por su email
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  // Traer un usuario por su ID
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, name, is_verified, pomodoro_goal FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  // Obtener todos los usuarios (para testing de la API)
  async getAllUsers() {
    const [rows] = await pool.execute(
      'SELECT id, email, name, is_verified, pomodoro_goal, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  // Verificar que la contraseña coincida
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Actualizar el token de verificación del usuario
  async updateVerificationToken(userId, token) {
    await pool.execute(
      'UPDATE users SET verification_token = ? WHERE id = ?',
      [token, userId]
    );
  },

  // Confirmar el email con el token recibido
  async verifyEmail(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE verification_token = ?',
      [token]
    );
    
    if (rows.length === 0) {
      throw new Error('El token de verificación no es válido');
    }

    const user = rows[0];
    
    // Marcar el email como verificado
    await pool.execute(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?',
      [user.id]
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      is_verified: true
    };
  }
};

module.exports = userService;
