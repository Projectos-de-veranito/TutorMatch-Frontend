import axios from 'axios';
import { TutoringSession, TutoringReview } from '../types/Tutoring';

const API_BASE_URL = `http://localhost:3000`;

export const TutoringService = {
  // Obtener una tutoría por ID
  getTutoringSession: async (id: string): Promise<TutoringSession> => {
    const response = await axios.get(`${API_BASE_URL}/tutoringSessions/${id}`);
    return new TutoringSession(response.data); // Usar el constructor para asegurar el tipo
  },

    // Obtener todas las tutorías
    getAllTutoringSessions: async (): Promise<TutoringSession[]> => {
      const response = await axios.get(`${API_BASE_URL}/tutoringSessions`);
      return response.data.map((session: any) => new TutoringSession(session));
    },
  
    // Obtener tutorías por semesterId
    getTutoringSessionsBySemesterId: async (semesterId: number): Promise<TutoringSession[]> => {
      const response = await axios.get(`${API_BASE_URL}/tutoringSessions`, {
        params: { semesterId }
      });
      return response.data.map((session: any) => new TutoringSession(session));
    },

        // Obtener tutorías por courseId
        getTutoringSessionsByCourseId: async (courseId: number): Promise<TutoringSession[]> => {
          const response = await axios.get(`${API_BASE_URL}/tutoringSessions`, {
            params: { courseId }
          });
          return response.data.map((session: any) => new TutoringSession(session));
        },

  // Obtener reseñas de una tutoría
  getReviews: async (tutoringId: string): Promise<TutoringReview[]> => {
    const response = await axios.get(`${API_BASE_URL}/reviews`, {
      params: { tutoringId },
    });
    return response.data.map((review: TutoringReview) => new TutoringReview(review)); // Usar el constructor
  },

  // Agregar una nueva tutoría
  createTutoing: async (tutoring: Partial<TutoringSession>): Promise<TutoringSession> => {
    try {
      // Convertir el objeto a JSON y enviar solo las propiedades necesarias
      const response = await axios.post(`${API_BASE_URL}/tutoringSessions`, tutoring);
      return new TutoringSession(response.data);
    } catch (error) {
      console.error('Error al agregar la tutoría:', error);
      throw error;
    }
  }
};