import { Router } from 'express';
import authRoutes from './auth'; // ✅ Este tiene /verify
import ticketRoutes from '../modules/tickets/tickets.routes';
import { simpleAuth } from '../middlewares/simpleAuth';
import path from 'path';
import process from 'process';

const currentDir = __dirname;
const router = Router();

// ✅ SOLO UNA RUTA PARA AUTH - ELIMINAR DUPLICADOS
router.use('/api/auth', authRoutes); // ← Este tiene /verify funcionando

// ✅ RUTAS DE TICKETS CON AUTENTICACIÓN
router.use('/api/tickets', simpleAuth, ticketRoutes);

export default router;