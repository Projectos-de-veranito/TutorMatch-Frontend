export interface PaymentPlan {
  id: string;
  name: string;
  amount: number;
  description: string;
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Payment {
  id: string;
  amount: number;
  created_at: string | null;
  metadata: Json | null;
  payment_method: string;
  plan_id: string;
  receipt_url: string;
  status: string;
  updated_at: string | null;
  user_id: string;
}