FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Generar Prisma client
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npx tsc

# Crear carpeta para uploads
RUN mkdir -p uploads

EXPOSE 3000  # Esto es solo documentación, Railway ignora EXPOSE

# ✅ COMANDO CORRECTO para Railway
CMD ["npm", "start"]