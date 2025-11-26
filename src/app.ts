// backend/src/app.ts - ACTUALIZADO PARA PRODUCCIÓN
import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './lib/prisma';
import ticketRoutes from './modules/tickets/tickets.routes';
import attachmentRoutes from './modules/attachments/attachments.routes';
import { simpleAuth } from './middlewares/simpleAuth';
import routes from './routes';
import process from 'process';
import { Request, Response, NextFunction } from 'express';


const currentDir = __dirname;
const app = express();



// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configurado para producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://tu-frontend.railway.app', // Reemplazar con tu URL de frontend
        'https://mesa-ayuda-clinica.railway.app' // Ejemplo
      ]
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    platform: process.platform,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/tickets/attachments', simpleAuth, attachmentRoutes);
app.use('/api/tickets', simpleAuth, ticketRoutes);

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
  console.log('🔧 CONFIGURACIÓN DEL SERVIDOR:');
console.log('PORT variable:', process.env.PORT);
console.log('PORT final:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurada' : '❌ No configurada');
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

app.use('/', routes);

export default app;