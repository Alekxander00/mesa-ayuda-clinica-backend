"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/app.ts - ACTUALIZADO PARA PRODUCCIÓN
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("./lib/prisma");
const tickets_routes_1 = __importDefault(require("./modules/tickets/tickets.routes"));
const attachments_routes_1 = __importDefault(require("./modules/attachments/attachments.routes"));
const simpleAuth_1 = require("./middlewares/simpleAuth");
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use((0, cors_1.default)(corsOptions));
// Servir archivos estáticos (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});
// API Routes
app.use('/api/tickets/attachments', simpleAuth_1.simpleAuth, attachments_routes_1.default);
app.use('/api/tickets', simpleAuth_1.simpleAuth, tickets_routes_1.default);
// Manejo de errores global
app.use((err, req, res, next) => {
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
        await prisma_1.prisma.$disconnect();
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});
exports.default = app;
