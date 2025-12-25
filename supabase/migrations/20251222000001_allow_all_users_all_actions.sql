-- Migração para permitir que todos os usuários autenticados realizem todas as ações
-- Remove restrições que limitam ações apenas para administradores

-- Remover políticas restritivas de admin e criar políticas que permitem todos os usuários autenticados

-- 1. Pens (Baias) - Permitir que todos os usuários autenticados gerenciem baias
DROP POLICY IF EXISTS "Admins can manage pens" ON pens;

CREATE POLICY "Authenticated users can manage pens"
  ON pens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 2. Animals - Permitir que todos os usuários autenticados possam deletar animais
DROP POLICY IF EXISTS "Admins can delete animals" ON animals;

CREATE POLICY "Authenticated users can delete animals"
  ON animals FOR DELETE
  TO authenticated
  USING (true);

-- 3. Services - Permitir que todos os usuários autenticados gerenciem serviços
DROP POLICY IF EXISTS "Admins can manage services" ON services;

CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Costs - Permitir que todos os usuários autenticados possam deletar custos
DROP POLICY IF EXISTS "Admins can delete costs" ON costs;

CREATE POLICY "Authenticated users can delete costs"
  ON costs FOR DELETE
  TO authenticated
  USING (true);

-- 5. Sales - Permitir que todos os usuários autenticados possam deletar vendas
DROP POLICY IF EXISTS "Admins can delete sales" ON sales;

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- 6. Cash Flow - Permitir que todos os usuários autenticados possam deletar fluxo de caixa
DROP POLICY IF EXISTS "Admins can delete cash flow" ON cash_flow;

CREATE POLICY "Authenticated users can delete cash flow"
  ON cash_flow FOR DELETE
  TO authenticated
  USING (true);

-- 7. Stock Movements - Permitir que todos os usuários autenticados possam atualizar e deletar movimentações de estoque
CREATE POLICY IF NOT EXISTS "Authenticated users can update stock movements"
  ON stock_movements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete stock movements"
  ON stock_movements FOR DELETE
  TO authenticated
  USING (true);

-- 8. Animal Food Consumption - Permitir que todos os usuários autenticados possam deletar consumo
CREATE POLICY IF NOT EXISTS "Authenticated users can delete consumption"
  ON animal_food_consumption FOR DELETE
  TO authenticated
  USING (true);

