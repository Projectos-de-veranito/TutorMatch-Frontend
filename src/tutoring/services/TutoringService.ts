import axios from 'axios';
import { TutoringSession, TutoringReview } from '../types/Tutoring';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

/**
 * Función para convertir nombres de campos de camelCase (backend) a snake_case (Supabase)
 */
const toSnakeCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => toSnakeCase(item));
  }
  
  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir camelCase a snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Casos especiales
      const finalKey = 
        key === 'tutorId' ? 'tutor_id' :
        key === 'courseId' ? 'course_id' :
        key === 'whatTheyWillLearn' ? 'what_they_will_learn' :
        key === 'imageUrl' ? 'image_url' :
        key === 'dayOfWeek' ? 'day_of_week' :
        key === 'startTime' ? 'start_time' :
        key === 'endTime' ? 'end_time' :
        key === 'studentId' ? 'student_id' :
        key === 'tutoringId' ? 'tutoring_id' :
        snakeKey;
      
      result[finalKey] = toSnakeCase(data[key]);
    }
  }
  return result;
};

/**
 * Función para convertir nombres de campos de snake_case (Supabase) a camelCase (frontend)
 */
const toCamelCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }
  
  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir snake_case a camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
      
      // Casos especiales
      const finalKey = 
        key === 'tutor_id' ? 'tutorId' :
        key === 'course_id' ? 'courseId' :
        key === 'what_they_will_learn' ? 'whatTheyWillLearn' :
        key === 'image_url' ? 'imageUrl' :
        key === 'day_of_week' ? 'dayOfWeek' :
        key === 'start_time' ? 'startTime' :
        key === 'end_time' ? 'endTime' :
        key === 'student_id' ? 'studentId' :
        key === 'tutoring_id' ? 'tutoringId' :
        camelKey;
      
      result[finalKey] = toCamelCase(data[key]);
    }
  }
  return result;
};

export const TutoringService = {
  // Obtener una tutoría por ID
  getTutoringSession: async (id: string): Promise<TutoringSession> => {
    try {
      // Primero obtenemos los datos básicos de la tutoría
      const response = await axios.get(`${API_URL}/tutoring-sessions/${id}`);
      console.log('Datos básicos de la tutoría:', response.data);

      // Convertimos los datos de snake_case a camelCase
      const tutoringData = toCamelCase(response.data);
      
      // Luego obtenemos los horarios disponibles para esta tutoría usando la ruta correcta
      try {
        const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${id}/available-times`);
        console.log('Horarios disponibles (datos):', timesResponse.data);
        
        // Convertir los horarios de snake_case a camelCase
        const availableTimes = toCamelCase(timesResponse.data);
        
        // Combinar los datos
        tutoringData.availableTimes = availableTimes;
      } catch (timesError) {
        console.warn('Error al obtener horarios:', timesError);
        tutoringData.availableTimes = [];
      }

      console.log("Tutoría completa con horarios:", tutoringData);
      return new TutoringSession(tutoringData);
    } catch (error) {
      console.error('Error al obtener tutoría:', error);
      throw error;
    }
  },

  // Obtener todas las tutorías
  getAllTutoringSessions: async (): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`);
      
      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );
            
            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            // Si falla, retornamos la sesión sin horarios
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías:', error);
      throw error;
    }
  },

  // Obtener tutorías por tutorId
  getTutoringSessionsByTutorId: async (tutorId: string): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`, {
        params: { tutorId }
      });
      
      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );
            
            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías por tutor:', error);
      throw error;
    }
  },

  // Obtener tutorías por courseId
  getTutoringSessionsByCourseId: async (courseId: string): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`, {
        params: { courseId }
      });
      
      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );
            
            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías por curso:', error);
      throw error;
    }
  },

  // Obtener reseñas de una tutoría
  getReviews: async (tutoringId: string): Promise<TutoringReview[]> => {
    try {
      console.log(`Obteniendo reseñas para la tutoría: ${tutoringId}`);

      // Usar la ruta correcta para obtener las reseñas de la tutoría específica
      const response = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/reviews`);
      console.log('Respuesta de reseñas:', response.data);

      // Si no hay reseñas, devolver un array vacío
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('No se recibieron reseñas o el formato es incorrecto');
        return [];
      }

      // Convertir reseñas de snake_case a camelCase
      const reviewsData = toCamelCase(response.data);

      // Para cada reseña, obtener los datos del estudiante
      const reviewsWithStudents = await Promise.all(
        reviewsData.map(async (review: any) => {
          try {
            const studentId = review.studentId;

            if (!studentId) {
              console.warn('Reseña sin ID de estudiante:', review);
              return review;
            }

            const studentResponse = await axios.get(`${API_URL}/profiles/${studentId}`);
            // Convertir datos del estudiante de snake_case a camelCase
            const studentData = toCamelCase(studentResponse.data);
            
            return {
              ...review,
              student: studentData
            };
          } catch (error) {
            console.warn(`Error al obtener datos del estudiante:`, error);
            return review;
          }
        })
      );

      return reviewsWithStudents.map((review: any) => new TutoringReview(review));
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      return [];
    }
  },

  // Crear una nueva tutoría
  createTutoring: async (tutoring: any): Promise<TutoringSession> => {
    try {
      console.log("Datos originales para crear tutoría:", tutoring);
      
      // Extraer los horarios disponibles antes de enviar el payload principal
      const availableTimes = tutoring.availableTimes || [];
      
      // Omitimos availableTimes del payload principal
      const { availableTimes: _, ...restData } = tutoring;
      
      // Preparar el payload para el backend - primero convertimos a camelCase
      // para la API del backend
      const tutoringData = {
        tutorId: restData.tutorId || restData.tutor_id,
        courseId: restData.courseId || restData.course_id,
        title: restData.title,
        description: restData.description,
        price: Number(restData.price),
        whatTheyWillLearn: restData.whatTheyWillLearn || restData.what_they_will_learn,
        imageUrl: restData.imageUrl || restData.image_url || ''
      };
      
      console.log("Payload formateado para API (camelCase):", tutoringData);
      
      // Enviar los datos básicos de la tutoría
      const response = await axios.post(`${API_URL}/tutoring-sessions`, tutoringData);
      
      // Convertir respuesta de snake_case a camelCase
      const createdTutoring = toCamelCase(response.data);
      
      const tutoringId = createdTutoring.id;
      console.log("Tutoría creada con ID:", tutoringId);
      
      // Si hay horarios disponibles, añadirlos uno por uno
      if (availableTimes && availableTimes.length > 0) {
        console.log("Agregando horarios disponibles para tutoría", tutoringId);
        
        for (const timeSlot of availableTimes) {
          try {
            // Preparar los datos para el tiempo disponible en camelCase para la API del backend
            const timeData = {
              tutoringId: tutoringId,
              dayOfWeek: Number(timeSlot.dayOfWeek || timeSlot.day_of_week),
              startTime: timeSlot.startTime || timeSlot.start_time,
              endTime: timeSlot.endTime || timeSlot.end_time
            };
            
            console.log("Agregando horario (camelCase):", timeData);
            
            const timeResponse = await axios.post(
              `${API_URL}/tutoring-sessions/${tutoringId}/available-times`,
              timeData
            );
            
            console.log("Horario agregado:", toCamelCase(timeResponse.data));
          } catch (timeError) {
            console.error("Error al agregar horario disponible:", timeError);
            if (axios.isAxiosError(timeError) && timeError.response) {
              console.error('Detalles del error de horario:', {
                status: timeError.response.status,
                data: timeError.response.data
              });
            }
          }
        }
      }
      
      // Obtener la tutoría completa (con sus horarios) para devolverla
      try {
        const updatedResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}`);
        const completeTutoringData = toCamelCase(updatedResponse.data);
        
        // Obtener los horarios disponibles
        const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/available-times`);
        const availableTimesData = toCamelCase(timesResponse.data);
        
        // Combinar todo
        completeTutoringData.availableTimes = availableTimesData;
        
        console.log("Tutoría completa:", completeTutoringData);
        return new TutoringSession(completeTutoringData);
      } catch (getError) {
        console.warn("Error al obtener la tutoría completa, devolviendo datos parciales:", getError);
        // Si hay error al obtener la tutoría actualizada, devolvemos lo que tenemos
        createdTutoring.availableTimes = availableTimes.map((time: any) => toCamelCase(time));
        return new TutoringSession(createdTutoring);
      }
    } catch (error) {
      console.error('Error al agregar la tutoría:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Detalles del error en respuesta:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },

  // Añadir un horario disponible
  addAvailableTime: async (tutoringId: string, availableTime: any): Promise<any> => {
    try {
      console.log("Datos originales para agregar horario:", availableTime);
      
      // Preparar el payload para el backend - en camelCase
      const timeData = {
        tutoringId: tutoringId,
        dayOfWeek: Number(availableTime.dayOfWeek || availableTime.day_of_week),
        startTime: availableTime.startTime || availableTime.start_time,
        endTime: availableTime.endTime || availableTime.end_time
      };
      
      console.log(`Agregando horario para tutoría ${tutoringId} (camelCase):`, timeData);
      
      const response = await axios.post(
        `${API_URL}/tutoring-sessions/${tutoringId}/available-times`,
        timeData
      );
      
      // Convertir respuesta de snake_case a camelCase
      const createdTime = toCamelCase(response.data);
      
      return createdTime;
    } catch (error) {
      console.error('Error al agregar horario disponible:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Detalles del error en horario:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  },


  // Actualizar una tutoría
  updateTutoring: async (tutoringId: string, updates: any): Promise<TutoringSession> => {
    try {
      console.log(`Datos originales para actualizar tutoría ${tutoringId}:`, updates);
      
      // Convertir campos a camelCase para la API
      const updateData = {
        ...(updates.image_url !== undefined && { imageUrl: updates.image_url }),
        ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
        ...(updates.what_they_will_learn !== undefined && { whatTheyWillLearn: updates.what_they_will_learn }),
        ...(updates.whatTheyWillLearn !== undefined && { whatTheyWillLearn: updates.whatTheyWillLearn }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.price !== undefined && { price: Number(updates.price) }),
        ...(updates.title !== undefined && { title: updates.title }),
      };
      
      console.log(`Datos formateados para actualizar tutoría (camelCase):`, updateData);
      
      const response = await axios.patch(
        `${API_URL}/tutoring-sessions/${tutoringId}`, 
        updateData
      );
      
      // Convertir respuesta de snake_case a camelCase
      const updatedTutoring = toCamelCase(response.data);
      
      return new TutoringSession(updatedTutoring);
    } catch (error) {
      console.error('Error al actualizar tutoría:', error);
      throw error;
    }
  },
  
  // Añadir una reseña a una tutoría
  addReview: async (tutoringId: string, review: any): Promise<any> => {
    try {
      console.log(`Datos originales para agregar reseña a tutoría ${tutoringId}:`, review);
      
      // Preparar el payload para el backend - en camelCase
      const reviewData = {
        tutoringId: tutoringId,
        studentId: review.studentId || review.student_id,
        rating: Number(review.rating),
        comment: review.comment
      };
      
      console.log(`Agregando reseña para tutoría ${tutoringId} (camelCase):`, reviewData);
      
      const response = await axios.post(
        `${API_URL}/tutoring-sessions/reviews`,
        reviewData
      );
      
      // Convertir respuesta de snake_case a camelCase
      const createdReview = toCamelCase(response.data);
      
      return new TutoringReview(createdReview);
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      throw error;
    }
  }
};