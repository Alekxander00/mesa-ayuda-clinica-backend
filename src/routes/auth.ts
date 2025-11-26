// backend/src/routes/auth.ts - SOLO AUTENTICACIÓN
import { Router } from 'express';
import path from 'path';
import process from 'process';
import { prisma } from '../lib/prisma';

const router = Router();

const currentDir = __dirname;
// Endpoint para obtener usuario actual
router.get('/me', async (req, res) => {
  try {
    const userEmail = req.headers['x-user-email'] as string;
    
    if (!userEmail) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para verificar/crear usuario
router.post('/verify', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Crear nuevo usuario
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password_hash: 'oauth-user', // Para usuarios de OAuth
          email_verified: true,
        }
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error en verify:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/debug-headers', async (req, res) => {
  console.log('🔍 DEBUG HEADERS - Todos los headers recibidos:');
  console.log(JSON.stringify(req.headers, null, 2));
  
  res.json({
    success: true,
    headers: req.headers,
    receivedEmail: req.headers['x-user-email'],
    timestamp: new Date().toISOString(),
    message: 'Revisa la consola del backend para ver todos los headers'
  });
});

export default router;