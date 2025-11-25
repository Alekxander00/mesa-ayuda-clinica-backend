// backend/src/modules/auth/auth.routes.ts - ACTUALIZADO
import { Router } from 'express';
import { debugAuth, syncUser, getUserInfo, listUsers } from './auth.controller';
import { simpleAuth } from '../../middlewares/simpleAuth';

const router = Router();

// Endpoints públicos
router.get('/debug', debugAuth);
router.post('/sync-user', syncUser);
router.get('/user-info', getUserInfo);

// Endpoints que requieren autenticación
router.get('/users', simpleAuth, listUsers);

export default router;