export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // En días
  features: string[];
  popular?: boolean;
  color?: string;
}

export interface UserPlan {
  id: number;
  tutorId: number;
  planId: number;
  startDate: string;
  endDate: string;
  active: boolean;
  paymentId?: number;
}

export interface PlanSubscription {
  plan: Plan;
  userPlan?: UserPlan;
  isActive: boolean;
}