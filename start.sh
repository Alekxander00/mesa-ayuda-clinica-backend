#!/bin/sh

# Esperar un momento para que la DB esté lista
sleep 5

# Hacer push del schema sin generar (ya se generó en el build)
npx prisma db push --skip-generate --accept-data-loss

# Iniciar la aplicación
npm start