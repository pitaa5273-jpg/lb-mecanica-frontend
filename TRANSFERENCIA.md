# Transferência de Frontend - LB Mecânica v2

## 📋 Resumo da Transferência

Este documento descreve a transferência bem-sucedida do visual e funcionalidades do frontend LB Mecânica (Netlify) para um novo projeto React com Vite, mantendo a conexão com o backend intacta.

## ✅ O que foi Transferido

### 1. **Estrutura de Páginas**
- ✅ **Login.jsx** - Autenticação com validação de credenciais
- ✅ **Dashboard.jsx** - Painel principal com resumo financeiro e contadores
- ✅ **Clientes.jsx** - CRUD completo de clientes
- ✅ **Veiculos.jsx** - CRUD completo de veículos
- ✅ **OS.jsx** - Gerenciamento de Ordens de Serviço
- ✅ **OSDetalhes.jsx** - Detalhes e edição de OS com serviços e peças
- ✅ **Financeiro.jsx** - Gerenciamento de lançamentos financeiros e relatórios

### 2. **Serviços e API**
- ✅ **services/api.js** - Configuração Axios com:
  - Base URL configurável via `VITE_API_URL`
  - Interceptador automático de token Bearer
  - Gerenciamento de autenticação via localStorage

### 3. **Roteamento**
- ✅ **React Router DOM v7** - Roteamento completo com:
  - Rotas públicas (Login)
  - Rotas privadas (Dashboard, CRUD, Financeiro)
  - Proteção de rotas com verificação de token
  - Redirecionamento automático para login se não autenticado

### 4. **Estilos e Visual**
- ✅ **Tema Laranja/Escuro** - Paleta de cores do frontend fonte:
  - Cor primária: `#FFA500` (Laranja)
  - Cor secundária: `#FF8C00` (Laranja escuro)
  - Fundo: Gradiente `#1a1a1a` a `#2d2d2d`
  - Cards brancos com sombras suaves

- ✅ **Estilos CSS Modernizados**:
  - Animações de entrada (slideInUp, fadeIn)
  - Transições suaves em botões e inputs
  - Hover effects e focus states
  - Responsividade mobile-first

### 5. **Funcionalidades Preservadas**
- ✅ Autenticação com token JWT
- ✅ Chamadas de API com autenticação automática
- ✅ Tratamento de erros
- ✅ Carregamento de dados dinâmico
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Geração de relatórios (Financeiro)

## 🔧 Configuração do Backend

### Variáveis de Ambiente
```bash
VITE_API_URL=http://localhost:3333  # URL do backend (padrão)
```

### Endpoints Utilizados
- `POST /auth/login` - Autenticação
- `GET /financeiro/summary` - Resumo financeiro
- `GET /os` - Listar Ordens de Serviço
- `GET /clientes` - Listar Clientes
- `GET /veiculos` - Listar Veículos
- `GET /financeiro` - Listar Lançamentos
- `POST /clientes` - Criar Cliente
- `PUT /clientes/:id` - Atualizar Cliente
- `DELETE /clientes/:id` - Deletar Cliente
- E operações similares para Veículos, OS, Financeiro

## 📦 Stack Tecnológico

- **React 19.2.1** - Framework UI
- **Vite 7.1.7** - Build tool
- **React Router DOM 7.14.2** - Roteamento
- **Axios 1.12.0** - Cliente HTTP
- **Tailwind CSS 4.1.14** - Utilitários de estilo
- **shadcn/ui** - Componentes UI reutilizáveis

## 🚀 Como Executar

### Desenvolvimento
```bash
cd /home/ubuntu/lb-mecanica-v2
pnpm install
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

### Build para Produção
```bash
pnpm build
```

### Preview de Produção
```bash
pnpm preview
```

## 🔐 Autenticação

### Fluxo de Login
1. Usuário insere credenciais na página de Login
2. Requisição POST para `/auth/login`
3. Backend retorna token JWT
4. Token é armazenado em `localStorage`
5. Interceptador de API adiciona token em todas as requisições
6. Usuário é redirecionado para Dashboard

### Proteção de Rotas
- Todas as rotas exceto `/` (Login) são privadas
- Se não houver token válido, usuário é redirecionado para Login
- Token é verificado automaticamente no carregamento de cada página

## 📝 Notas Importantes

### Conexão com Backend
- ✅ A conexão com o backend foi **completamente preservada**
- ✅ Nenhuma lógica de API foi alterada
- ✅ Todos os endpoints continuam funcionando normalmente
- ✅ O interceptador de autenticação está intacto

### Estilos
- Os estilos CSS foram mantidos do frontend original
- Adicionadas animações e transições para melhor UX
- Tema consistente em todas as páginas
- Responsividade mantida

### Compatibilidade
- Projeto 100% compatível com o backend existente
- Nenhuma mudança em endpoints ou formato de dados
- Token JWT continua sendo utilizado da mesma forma

## 🐛 Troubleshooting

### "Failed to load url /src/main.tsx"
- Solução: Arquivo foi renomeado para `main.jsx` (JavaScript, não TypeScript)
- Verificar se `client/index.html` aponta para `/src/main.jsx`

### "Cannot find module 'react-router-dom'"
- Solução: Executar `pnpm install` para instalar dependências
- Verificar se `react-router-dom` está em `package.json`

### Erro de conexão com API
- Verificar se `VITE_API_URL` está configurada corretamente
- Confirmar que o backend está rodando na porta correta
- Verificar se o token está sendo enviado corretamente

## 📞 Suporte

Para mais informações sobre o projeto ou problemas com a integração, consulte:
- Documentação do React: https://react.dev
- Documentação do Vite: https://vitejs.dev
- Documentação do React Router: https://reactrouter.com
