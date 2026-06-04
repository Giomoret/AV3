
# AeroCode - Sistema de Gestão de Produção Aeronáutica

Este projeto é uma aplicação Full-Stack desenvolvida para o gerenciamento de aeronaves, peças, funcionários e etapas de produção.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com **Express**
- **TypeScript**
- **Prisma ORM**
- **MySQL** (Banco de Dados)
- **JWT** (Autenticação)

### Frontend
- **React** com **TypeScript**
- **Recharts** (Gráficos)
- **React Router DOM** (Navegação)

---

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
1. [Node.js](https://nodejs.org/) (versão LTS recomendada).
2. [MySQL Server](https://dev.mysql.com/downloads/installer/) (ou utilize o XAMPP).
3. [Git](https://git-scm.com/).

---

## ⚙️ Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Giomoret/AV3
   cd AV3

```

2. **Instale as dependências (Backend e Frontend):**
```bash
# Na raiz ou pasta backend
cd backend
npm install

# Na pasta frontend
cd ../frontend
npm install

```


3. **Configuração do Banco de Dados:**
* Crie um banco de dados vazio no seu MySQL chamado `aerocode` (ou o nome de sua preferência).
* Na pasta `backend`, crie um arquivo `.env` e adicione a conexão:
```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/nome_do_banco"

```


* Gere o Prisma Client e sincronize o banco:
```bash
npx prisma generate
npx prisma db push

```





---

## ▶️ Como rodar o projeto

Você precisará de **dois terminais** abertos simultaneamente:

1. **Terminal 1 (Backend):**
```bash
cd backend
npx tsx src/AppServer.mts

```


2. **Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev

```



Acesse o sistema no endereço fornecido pelo terminal do frontend (geralmente `http://localhost:5173`).

---

## 🆘 Solução de Problemas Comuns

* **Erro `P2002` (Unique Constraint):** Ocorre ao tentar cadastrar dados duplicados (CPF/Login). Verifique se não há registros "órfãos" no banco.
* **Porta 3000 ocupada:** Se o backend falhar ao iniciar, certifique-se de encerrar processos anteriores no Gerenciador de Tarefas ou terminal.
* **Mudanças no Banco:** Sempre que alterar o arquivo `schema.prisma`, rode `npx prisma db push` e `npx prisma generate` novamente.

---

*Projeto desenvolvido como parte da disciplina de Análise e Desenvolvimento de Sistemas (Fatec SJC).*
