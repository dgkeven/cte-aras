import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'employee';
  created_at: string;
  updated_at: string;
};

export type Animal = {
  id: string;
  name: string;
  identification_number: string;
  breed: string;
  sex: 'male' | 'female';
  castrated: boolean;
  father_id?: string;
  mother_id?: string;
  photo_url?: string;
  pen_id?: string;
  entry_date: string;
  entry_weight: number;
  current_weight: number;
  exit_date?: string;
  status: 'active' | 'sold' | 'dead';
  created_at: string;
};

export type Pen = {
  id: string;
  name: string;
  capacity: number;
  current_occupancy: number;
  daily_cost: number;
  active: boolean;
  created_at: string;
};

export type Food = {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  unit_cost: number;
  active: boolean;
  created_at: string;
};

export type Cost = {
  id: string;
  animal_id?: string;
  cost_type: 'food' | 'service' | 'pen' | 'veterinary' | 'other';
  description: string;
  amount: number;
  date: string;
  created_by: string;
  created_at: string;
};

export type Sale = {
  id: string;
  animal_id: string;
  buyer_name: string;
  buyer_contact?: string;
  sale_price: number;
  sale_date: string;
  payment_date?: string;
  paid: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
};

export type CashFlow = {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method?: string;
  reference_id?: string;
  created_by: string;
  created_at: string;
};
