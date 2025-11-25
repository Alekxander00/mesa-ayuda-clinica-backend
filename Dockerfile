# Usar Node.js 18 Alpine (más pequeño y seguro)
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente
COPY src ./src

# Compilar TypeScript a JavaScript
RUN npx tsc

# Generar cliente de Prisma
RUN npx prisma generate

# Crear carpeta para uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js || exit 1

# Comando para ejecutar la aplicación
CMD ["sh", "-c", "npx prisma db push && npm start"]