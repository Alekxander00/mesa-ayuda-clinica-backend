FROM node:18-alpine

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm ci --include=dev

# Generar Prisma client
RUN npx prisma generate

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npx tsc

# Instalar solo production dependencies para runtime (opcional)
RUN npm ci --only=production && npm cache clean --force

# Crear carpeta para uploads
RUN mkdir -p uploads

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npm start"]