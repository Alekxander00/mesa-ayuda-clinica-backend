// backend/src/modules/auth/auth.routes.ts - ACTUALIZADO
import { Router } from 'express';
import { debugAuth, syncUser, getUserInfo, listUsers } from './auth.controller';
import { simpleAuth } from '../../middlewares/simpleAuth';
import path from 'path';
import process from 'process';
import { prisma } from '@/lib/prisma';

const currentDir = __dirname;
const router = Router();

// Endpoints públicos
router.get('/debug', debugAuth);
router.post('/sync-user', syncUser);
router.get('/user-info', getUserInfo);

// Endpoints que requieren autenticación
router.get('/users', simpleAuth, listUsers);

router.post('/sync-user', async (req, res) => {
    try {
      const { email, name } = req.body;
      
      console.log('🔄 SYNC-USER - Sincronizando:', email);
      
      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }
  
      // Buscar usuario existente
      let user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          email_verified: true,
        },
      });
  
      // Si no existe, crear usuario
      if (!user) {
        console.log('🆕 SYNC-USER: Creando nuevo usuario...');
        
        const userCount = await prisma.user.count();
        let defaultRole: 'user' | 'technician' | 'admin' = 'user';
  
        if (userCount === 0) defaultRole = 'admin';
        else if (userCount === 1) defaultRole = 'technician';
        else if (email.includes('admin')) defaultRole = 'admin';
        else if (email.includes('tech') || email.includes('soporte')) defaultRole = 'technician';
  
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            password_hash: 'oauth-google',
            role: defaultRole,
            email_verified: true,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            email_verified: true,
          },
        });
      }
  
      console.log('✅ SYNC-USER: Usuario listo:', user);
      res.json(user);
      
    } catch (error) {
      console.error('❌ Error en sync-user:', error);
      res.status(500).json({ error: 'Error sincronizando usuario' });
    }
  });
  
  // Este endpoint ya debería existir según tu código anterior
  router.get('/user-info', async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }
  
      const user = await prisma.user.findUnique({
        where: { email: email as string },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          email_verified: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error en user-info:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });

export default router;