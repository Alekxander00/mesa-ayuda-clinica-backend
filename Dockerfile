FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias
RUN npm install

# Generar Prisma client (esto puede fallar sin DATABASE_URL, pero es necesario)
RUN npx prisma generate || echo "Prisma generate falló, continuando..."

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npx tsc

# Crear carpeta para uploads
RUN mkdir -p uploads

EXPOSE 3001

# Comando que primero hace db push y luego inicia la app
CMD ["sh", "-c", "npx prisma db push && npm start"]