# ✈️ AeroCode — Sistema de Gestão de Produção Aeronáutica

Sistema Full-Stack para gerenciamento de aeronaves, peças, funcionários, etapas de produção, testes e relatórios. Desenvolvido como projeto acadêmico na **FATec São José dos Campos** para a disciplina de POO em Análise e Desenvolvimento de Sistemas.

---

## 🧱 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** + **TypeScript** (`.mts`)
- **Prisma ORM** + **MySQL**
- **JWT** para autenticação
- **Docker** para containerização

### Frontend
- **React** + **TypeScript** + **Vite**
- **React Router DOM** para navegação
- **Recharts** para gráficos e visualizações

---

## 📁 Estrutura do Projeto

```
AV3/
├── backend/
│   ├── src/
│   │   ├── AppServer.mts         # Servidor Express + rotas
│   │   └── middlewares/
│   ├── prisma/
│   │   └── schema.prisma         # Schema do banco de dados
│   ├── Dockerfile
│   └── .env                      # Variável de ambiente (não versionada)
├── frontend/
│   └── src/
│       ├── Aeronaves.tsx
│       ├── Etapas.tsx
│       ├── Funcionarios.tsx
│       ├── Pecas.tsx
│       ├── Relatorios.tsx
│       └── ...
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Pré-requisitos

Escolha **uma** das duas formas de rodar o projeto:

### Opção A — Rodando com Docker (recomendado)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Opção B — Rodando manualmente
- [Node.js](https://nodejs.org/) (versão LTS)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) ou [XAMPP](https://www.apachefriends.org/)
- [Git](https://git-scm.com/)

---

## 🐳 Opção A — Rodando com Docker

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Giomoret/AV3
   cd AV3
   ```

2. **Suba os containers:**
   ```bash
   docker-compose up --build
   ```

   Isso irá subir o banco de dados MySQL e o backend automaticamente.

3. **Inicie o frontend separadamente:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Acesse em `http://localhost:5173`.

---

## ⚙️ Opção B — Rodando Manualmente

### 1. Clone o repositório
```bash
git clone https://github.com/Giomoret/AV3
cd AV3
```

### 2. Instale as dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure o Banco de Dados

- Crie um banco de dados vazio no MySQL:
  ```sql
  CREATE DATABASE aerocode;
  ```

- (Opcional) Use o arquivo SQL do projeto para popular o banco com dados iniciais:
  ```bash
  # No MySQL Workbench ou terminal MySQL:
  SOURCE caminho/para/o/arquivo.sql;
  ```

- Na pasta `backend`, crie o arquivo `.env` baseado no `.env_example`:
  ```env
  DATABASE_URL="mysql://usuario:senha@localhost:3306/aerocode"
  ```

### 4. Configure o Prisma
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Rode o projeto

Abra **dois terminais**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Acesse em `http://localhost:5173`.

---

## 👤 Acesso Inicial

Após subir o banco com os dados do arquivo SQL, o sistema já possui um usuário administrador padrão:

| Campo  | Valor   |
|--------|---------|
| Login  | `admin` |
| Senha  | `123`   |

> ⚠️ Recomenda-se alterar a senha após o primeiro acesso.

---

## 📋 Funcionalidades

| Módulo         | Descrição                                              |
|----------------|--------------------------------------------------------|
| Aeronaves       | Cadastro e gerenciamento de aeronaves                 |
| Peças           | Controle de peças por aeronave com paginação          |
| Funcionários    | Cadastro com endereço, telefone e controle de acesso  |
| Etapas          | Etapas de produção com atribuição de funcionários     |
| Controle de Testes | Registro de testes por aeronave (Elétrico, Hidráulico, Aerodinâmico) |
| Relatórios      | Geração de relatório final por aeronave               |

---

## 🆘 Solução de Problemas Comuns

**Erro `P2002` (Unique Constraint):**
Ocorre ao tentar salvar CPF ou login duplicado. Verifique se não há registros órfãos na tabela `User`:
```sql
SELECT * FROM User;
DELETE FROM User WHERE funcionarioId IS NULL;
```

**Porta 3000 ocupada:**
Encerre processos anteriores antes de iniciar o backend:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero_do_pid> /F
```

**Alterações no Schema:**
Sempre que modificar o `schema.prisma`, rode:
```bash
npx prisma db push
npx prisma generate
```

**Erro de módulo não encontrado no backend:**
Certifique-se de estar na pasta correta:
```bash
cd backend
npm run dev
```

---

*Projeto desenvolvido na **FATEC São José dos Campos** — Curso de Análise e Desenvolvimento de Sistemas (ADS), 2026.*
