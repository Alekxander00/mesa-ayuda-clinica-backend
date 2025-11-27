// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './lib/prisma';
import routes from './routes'; // ✅ IMPORTAR RUTAS
import process from 'process';

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configurado para desarrollo
app.use(cors({
  origin: ['http://localhost:3000', 'https://mesa-ayuda-clinica-frontend-production.up.railway.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-email', 'Authorization']
}));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: 'Backend funcionando correctamente'
  });
});

// ✅ MONTAR TODAS LAS RUTAS DESDE EL ARCHIVO DE RUTAS
app.use('/', routes);

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3001;

// Inicialización del servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recibido SIGTERM, cerrando servidor...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;