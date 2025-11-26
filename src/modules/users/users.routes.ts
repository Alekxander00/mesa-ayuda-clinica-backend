// backend/src/modules/users/users.routes.ts - CON ROLES
import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats
} from './users.controller';
import { requireAdmin, requireTechnician } from '../../middlewares/roleAuth';
import path from 'path';
import process from 'process';

// Para __dirname, usa:
const currentDir = __dirname;
const router = Router();

// Solo admin puede gestionar usuarios
router.get('/', requireAdmin, getUsers);
router.get('/stats', requireAdmin, getUserStats);
router.get('/:id', requireAdmin, getUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;