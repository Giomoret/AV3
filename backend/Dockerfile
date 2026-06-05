# Use uma imagem leve do Node
FROM node:18-alpine

# Instala compiladores, Python e as bibliotecas gráficas necessárias para o 'canvas'
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    librsvg-dev \
    pkgconfig

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Gera o cliente do Prisma
RUN npx prisma generate

# Expõe a porta 3000
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npx", "tsx", "src/AppServer.mts"]