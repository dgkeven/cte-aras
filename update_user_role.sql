-- Script para atualizar a role de um usuário para admin
-- Execute este script no SQL Editor do Supabase

-- Atualizar a role do usuário para 'admin'
UPDATE profiles
SET role = 'admin',
    updated_at = now()
WHERE id = 'f2063197-1256-414b-922a-4afc2367ad04';

-- Verificar se a atualização foi bem-sucedida
SELECT id, full_name, role, created_at, updated_at
FROM profiles
WHERE id = 'f2063197-1256-414b-922a-4afc2367ad04';

