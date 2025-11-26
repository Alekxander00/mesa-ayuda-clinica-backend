FROM node:18-alpine

# Instalar OpenSSL y otras dependencias necesarias
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Generar Prisma client
RUN npx prisma generate

# Build de la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]