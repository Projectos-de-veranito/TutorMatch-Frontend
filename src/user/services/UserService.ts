import axios from 'axios';
import { User } from '../types/User';

const API_BASE_URL = `http://localhost:3000`;

export const UserService = {
  // Obtener un usuario por ID
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      return new User(response.data);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Otros métodos que puedas necesitar...
};