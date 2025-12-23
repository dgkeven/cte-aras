## CTE Aras

Aplicação front-end construída com Vite + React + TypeScript, estilizada com Tailwind CSS e integrada ao Supabase.

**Descrição:**
- **Objetivo:** Painel administrativo para gerenciamento de animais, vendas, custos e relatórios.
- **Stack:** Vite, React, TypeScript, Tailwind CSS, Supabase

**Pré-requisitos:**
- Node.js (recomendado v18+)
- npm ou yarn

**Instalação:**

1. Clone o repositório:

```bash
git clone <repo-url>
cd cte-aras
```

2. Instale dependências:

```bash
npm install
# ou
yarn
```

3. Configure variáveis de ambiente criando um arquivo `.env` na raiz com as chaves do Supabase (não comite esse arquivo):

```
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua_anon_key>
```

OBS: O repositório contém um arquivo `.env` local — remova ou rotacione chaves antes de publicar.

**Scripts úteis:**
- **dev:** inicia o servidor de desenvolvimento
- **build:** gera os arquivos de produção
- **preview:** serve a build localmente
- **lint:** executa o ESLint
- **typecheck:** executa o TypeScript typecheck

Comandos:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
```

**Estrutura importante:**
- `src/` — código fonte React/TypeScript
- `src/pages/` — páginas do app: Animals, Foods, Pens, Sales, Costs, CashFlow, Reports, Users, Dashboard, Login
- `src/contexts/AuthContext.tsx` — contexto de autenticação
- `src/lib/supabase.ts` — inicialização do cliente Supabase
- `supabase/migrations/` — migrations SQL

**Supabase:**
- A integração usa `@supabase/supabase-js`. As migrations estão em `supabase/migrations`.
- Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` para apontar para seu projeto Supabase.

**Segurança:**
- Nunca comite chaves em repositórios públicos. Se uma chave foi comprometida, revogue/rotacione no painel do Supabase.

**Deploy:**
- Buildar com `npm run build` e subir os arquivos gerados (`dist/`) no seu provedor (Netlify, Vercel, Azure Static Web Apps, etc.).
- Configure as variáveis de ambiente no painel do serviço de hospedagem.

**Contribuindo:**
- Abra issues para bugs/funcionalidades e crie PRs para alterações.

**Licença:**
- Ver [LICENSE](LICENSE) para detalhes.

**Contato:**
- Mantenha o README atualizado com instruções adicionais, se necessário.
