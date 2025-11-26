// backend/src/routes/index.ts - CORREGIDO
import { Router } from 'express';
import authRoutes from './auth';
import ticketRoutes from '../modules/tickets/tickets.routes';
import authModuleRoutes from '../modules/auth/auth.routes';
import { simpleAuth } from '../middlewares/simpleAuth'; // ✅ IMPORTAR MIDDLEWARE
import path from 'path';
import process from 'process';

const currentDir = __dirname;
const router = Router();

// Rutas públicas (sin autenticación)
router.use('/api/auth', authRoutes);

// ✅ APLICAR MIDDLEWARE A TODAS LAS RUTAS DE TICKETS
router.use('/api/tickets', simpleAuth, ticketRoutes);
router.use('/api/auth', authModuleRoutes);
router.use('/api/tickets', simpleAuth, ticketRoutes);

export default router;