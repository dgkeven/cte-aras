-- Adicionar política para permitir que admins atualizem perfis de outros usuários
-- Isso permite que administradores possam alterar roles de outros usuários

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

