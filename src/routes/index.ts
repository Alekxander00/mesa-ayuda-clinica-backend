// backend/src/routes/index.ts

import { Router } from 'express';
import authRoutes from './auth'; // ✅ Solo authRoutes
import ticketRoutes from '../modules/tickets/tickets.routes';
import { simpleAuth } from '../middlewares/simpleAuth';

const router = Router();

// ✅ SOLO UNA RUTA PARA AUTH
router.use('/api/auth', authRoutes);

// ✅ RUTAS DE TICKETS CON AUTENTICACIÓN
router.use('/api/tickets', simpleAuth, ticketRoutes);

export default router;