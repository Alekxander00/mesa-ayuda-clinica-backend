FROM node:18-bullseye  # Usamos Debian en lugar de Alpine

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

EXPOSE 3001

# Comando de inicio mejorado
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm start"]