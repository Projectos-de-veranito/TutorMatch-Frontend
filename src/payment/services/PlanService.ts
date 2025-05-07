import axios from 'axios';
import { Plan } from '../types/Plan';
import { User, PlanType } from '../../user/types/User';

const API_BASE_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export class PlanService {
  /**
   * Verifica si el usuario es un tutor
   */
  static isTutor(user?: User | null): boolean {
    return user?.role === 'tutor';
  }
  
  /**
   * Verifica si el tutor tiene un plan activo
   */
  static hasPlan(user?: User | null): boolean {
    if (!user || !this.isTutor(user)) return false;
    
    return !!user.hasPlan && 
           !!user.planType &&
           !!user.planExpirationDate && 
           user.planExpirationDate > new Date();
  }

  /**
   * Obtiene todos los planes disponibles
   */
  static async getPlans(): Promise<Plan[]> {
    try {

      const response = await axios.get(`${API_BASE_URL}/plans`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener planes:', error);
      return [];
    }
  }

  /**
   * Obtiene un plan específico por su ID
   */
  static async getPlanById(planId: number): Promise<Plan | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el plan ${planId}:`, error);
      return null;
    }
  }

  /**
   * Suscribe a un tutor a un plan
   */
  static async subscribeToPlan(userId: number, planId: number, paymentId?: number): Promise<User | null> {
    try {
      // Primero obtenemos la información del usuario
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      const userData = response.data;
      
      // Verificamos que sea un tutor
      if (userData.role !== 'tutor') {
        throw new Error('Solo los tutores pueden suscribirse a planes');
      }
      
      // Obtenemos la información del plan
      const plan = await this.getPlanById(planId);
      
      if (!plan) {
        throw new Error(`No se pudo encontrar el plan con ID ${planId}`);
      }
      
      // Calculamos las fechas
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration);
      
      // Actualizamos la información del usuario
      const updatedUserData = {
        ...userData,
        planType: plan.name.toLowerCase() as PlanType,
        planExpirationDate: endDate.toISOString(),
        hasPlan: true
      };
      
      // Guardamos los cambios
      const updateResponse = await axios.put(`${API_BASE_URL}/users/${userId}`, updatedUserData);
      
      // Registramos el historial de pago (en una aplicación real)
      const paymentData = {
        userId,
        planId,
        paymentId: paymentId || Math.floor(Math.random() * 1000000),
        amount: plan.price,
        date: startDate.toISOString(),
        status: 'completed'
      };
      
      await axios.post(`${API_BASE_URL}/payments`, paymentData);
      
      return new User(updateResponse.data);
    } catch (error) {
      console.error('Error al suscribirse al plan:', error);
      return null;
    }
  }

  /**
   * Obtiene el número máximo de tutorías según el plan del tutor
   */
  static getMaxTutorings(user?: User | null): number {
    if (!user || !this.isTutor(user) || !user.planType) return 0;
    
    switch (user.planType) {
      case 'premium':
        return Infinity;
      case 'standard':
        return 8;
      case 'basic':
        return 2;
      default:
        return 0;
    }
  }
  
  /**
   * Calcula los días restantes del plan del tutor
   */
  static getDaysRemaining(user?: User | null): number {
    if (!user || !this.isTutor(user) || !user.planExpirationDate) return 0;
    
    const today = new Date();
    const expDate = new Date(user.planExpirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Verifica si un tutor necesita seleccionar un plan
   * (recién registrado sin plan o con plan expirado)
   */
  static needsPlan(user?: User | null): boolean {
    if (!user || !this.isTutor(user)) return false;
    
    // Si no tiene plan o está expirado
    return !this.hasPlan(user);
  }
}