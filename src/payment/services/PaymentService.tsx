import { PaymentPlan } from "../types/Payment";

const API_URL = import.meta.env.VITE_TUTORMATCH_PAYMENT_BACKEND_URL;

export class PaymentService {
  /**
   * Obtiene los planes de pago disponibles
   */
static async getPlans(): Promise<PaymentPlan[]> {
    try {
        const response = await fetch(`${API_URL}/plans`);
        
        if (!response.ok) {
            throw new Error('Error al obtener los planes de pago');
        }
        
        const plansData = await response.json();
        
        // Transformar los datos del backend a nuestro formato interno
        return plansData.map((plan: any) => ({
            id: plan.id,
            name: plan.name,
            amount: plan.amount,
            description: plan.description,
        }));
    } catch (error) {
        console.error('Error en getPlans:', error);
        throw error;
    }
}

  /**
   * Verifica un comprobante de pago
   */
  static async verifyPayment(paymentData: {
    receipt: File;
    userId: string;
    planId: string;
    amount: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('receipt', paymentData.receipt);
      formData.append('userId', paymentData.userId);
      formData.append('planId', paymentData.planId);
      formData.append('amount', paymentData.amount.toString());

      const response = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el pago');
      }

      return {
        success: true,
        message: data.message || 'Pago verificado correctamente',
      };
    } catch (error: any) {
      console.error('Error en verifyPayment:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión. Por favor, inténtelo de nuevo.',
      };
    }
  }

  /**
   * Registra un plan comprado por el usuario
   */
  static async registerPurchase(data: {
    userId: string;
    planId: string;
    transactionId: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/payments/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar la compra');
      }

      return {
        success: true,
        message: result.message || 'Compra registrada correctamente',
      };
    } catch (error: any) {
      console.error('Error en registerPurchase:', error);
      return {
        success: false,
        message: error.message || 'Error de conexión. Por favor, inténtelo de nuevo.',
      };
    }
  }

  /**
   * Obtiene el historial de pagos de un usuario
   */
  static async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/payments/history/${userId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el historial de pagos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en getPaymentHistory:', error);
      throw error;
    }
  }
}