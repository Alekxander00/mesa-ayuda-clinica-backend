FROM node:18-bullseye

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
COPY start.sh ./

# Dar permisos al script
RUN chmod +x start.sh

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

# Usar el script de inicio
CMD ["./start.sh"]