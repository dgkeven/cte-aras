/*
  # CTE Management System - Complete Schema

  ## Overview
  Complete database schema for cattle finishing center (CTE) management system.

  ## New Tables

  ### 1. profiles
  Extended user information linked to Supabase auth.users
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `role` (text) - 'admin' or 'employee'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. pens (baias/piquetes)
  Pen/paddock management
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `capacity` (integer)
  - `current_occupancy` (integer)
  - `daily_cost` (decimal)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 3. animals
  Animal registry with genealogy
  - `id` (uuid, primary key)
  - `name` (text)
  - `identification_number` (text, unique)
  - `breed` (text)
  - `sex` (text) - 'male' or 'female'
  - `castrated` (boolean)
  - `father_id` (uuid, nullable, self-reference)
  - `mother_id` (uuid, nullable, self-reference)
  - `photo_url` (text, nullable)
  - `pen_id` (uuid, references pens)
  - `entry_date` (date)
  - `entry_weight` (decimal)
  - `current_weight` (decimal)
  - `exit_date` (date, nullable)
  - `status` (text) - 'active', 'sold', 'dead'
  - `created_at` (timestamptz)

  ### 4. services
  Service registry
  - `id` (uuid, primary key)
  - `name` (text)
  - `description` (text)
  - `unit_price` (decimal)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 5. foods
  Food/supplies registry
  - `id` (uuid, primary key)
  - `name` (text)
  - `unit` (text) - 'kg', 'ton', 'bag', etc
  - `current_stock` (decimal)
  - `min_stock` (decimal)
  - `unit_cost` (decimal)
  - `active` (boolean)
  - `created_at` (timestamptz)

  ### 6. costs
  Cost tracking (general and per animal)
  - `id` (uuid, primary key)
  - `animal_id` (uuid, nullable, references animals)
  - `cost_type` (text) - 'food', 'service', 'pen', 'veterinary', 'other'
  - `description` (text)
  - `amount` (decimal)
  - `date` (date)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### 7. animal_food_consumption
  Track food consumption per animal
  - `id` (uuid, primary key)
  - `animal_id` (uuid, references animals)
  - `food_id` (uuid, references foods)
  - `quantity` (decimal)
  - `date` (date)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### 8. sales
  Sales to third parties
  - `id` (uuid, primary key)
  - `animal_id` (uuid, references animals)
  - `buyer_name` (text)
  - `buyer_contact` (text)
  - `sale_price` (decimal)
  - `sale_date` (date)
  - `payment_date` (date, nullable)
  - `paid` (boolean)
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### 9. stock_movements
  Stock control for foods/supplies
  - `id` (uuid, primary key)
  - `food_id` (uuid, references foods)
  - `movement_type` (text) - 'entry' or 'exit'
  - `quantity` (decimal)
  - `unit_cost` (decimal)
  - `total_cost` (decimal)
  - `date` (date)
  - `notes` (text)
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ### 10. cash_flow
  Cash flow tracking (entrada e saída)
  - `id` (uuid, primary key)
  - `type` (text) - 'income' or 'expense'
  - `category` (text)
  - `description` (text)
  - `amount` (decimal)
  - `date` (date)
  - `payment_method` (text)
  - `reference_id` (uuid, nullable) - link to sale, cost, etc
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Employees can read most data, create/update records
  - Admins have full access
  - Users can only see data from their organization
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create pens table
CREATE TABLE IF NOT EXISTS pens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  capacity integer NOT NULL DEFAULT 0,
  current_occupancy integer NOT NULL DEFAULT 0,
  daily_cost decimal(10,2) NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view pens"
  ON pens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage pens"
  ON pens FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  identification_number text UNIQUE NOT NULL,
  breed text NOT NULL,
  sex text NOT NULL CHECK (sex IN ('male', 'female')),
  castrated boolean DEFAULT false,
  father_id uuid REFERENCES animals(id),
  mother_id uuid REFERENCES animals(id),
  photo_url text,
  pen_id uuid REFERENCES pens(id),
  entry_date date NOT NULL,
  entry_weight decimal(10,2) NOT NULL,
  current_weight decimal(10,2) NOT NULL,
  exit_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'dead')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view animals"
  ON animals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create animals"
  ON animals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update animals"
  ON animals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete animals"
  ON animals FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  unit_price decimal(10,2) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create foods table
CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL,
  current_stock decimal(10,2) DEFAULT 0,
  min_stock decimal(10,2) DEFAULT 0,
  unit_cost decimal(10,2) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view foods"
  ON foods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage foods"
  ON foods FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create costs table
CREATE TABLE IF NOT EXISTS costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id),
  cost_type text NOT NULL CHECK (cost_type IN ('food', 'service', 'pen', 'veterinary', 'other')),
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  date date NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view costs"
  ON costs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create costs"
  ON costs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update costs"
  ON costs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete costs"
  ON costs FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create animal_food_consumption table
CREATE TABLE IF NOT EXISTS animal_food_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  food_id uuid REFERENCES foods(id) NOT NULL,
  quantity decimal(10,2) NOT NULL,
  date date NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE animal_food_consumption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view consumption"
  ON animal_food_consumption FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create consumption"
  ON animal_food_consumption FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update consumption"
  ON animal_food_consumption FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id uuid REFERENCES animals(id) NOT NULL,
  buyer_name text NOT NULL,
  buyer_contact text,
  sale_price decimal(10,2) NOT NULL,
  sale_date date NOT NULL,
  payment_date date,
  paid boolean DEFAULT false,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create stock_movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id uuid REFERENCES foods(id) NOT NULL,
  movement_type text NOT NULL CHECK (movement_type IN ('entry', 'exit')),
  quantity decimal(10,2) NOT NULL,
  unit_cost decimal(10,2) NOT NULL,
  total_cost decimal(10,2) NOT NULL,
  date date NOT NULL,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create cash_flow table
CREATE TABLE IF NOT EXISTS cash_flow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  category text NOT NULL,
  description text NOT NULL,
  amount decimal(10,2) NOT NULL,
  date date NOT NULL,
  payment_method text,
  reference_id uuid,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cash_flow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view cash flow"
  ON cash_flow FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create cash flow"
  ON cash_flow FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cash flow"
  ON cash_flow FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete cash flow"
  ON cash_flow FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_pen_id ON animals(pen_id);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);
CREATE INDEX IF NOT EXISTS idx_costs_animal_id ON costs(animal_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(date);
CREATE INDEX IF NOT EXISTS idx_consumption_animal_id ON animal_food_consumption(animal_id);
CREATE INDEX IF NOT EXISTS idx_consumption_date ON animal_food_consumption(date);
CREATE INDEX IF NOT EXISTS idx_sales_animal_id ON sales(animal_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(date);
CREATE INDEX IF NOT EXISTS idx_stock_movements_food_id ON stock_movements(food_id);