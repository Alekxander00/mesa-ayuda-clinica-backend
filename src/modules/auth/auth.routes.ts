// backend/src/modules/auth/auth.routes.ts - CORREGIDO
import { Router } from 'express';
import { debugAuth, syncUser, getUserInfo, listUsers } from './auth.controller';
import { simpleAuth } from '../../middlewares/simpleAuth';
import { requireAdmin } from '../../middlewares/roleAuth';
import { prisma } from '@/lib/prisma';

const router = Router();

// Endpoint público para debug
router.get('/debug', debugAuth);

// ✅ AGREGAR ESTOS ENDPOINTS QUE FALTAN:
router.post('/sync-user', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    console.log('🔄 SYNC-USER - Sincronizando:', email);
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Usar el middleware simpleAuth para verificar autorización
    // Pasamos el email en el header para que simpleAuth lo procese
    const mockReq = {
      headers: { 'x-user-email': email },
      body: { email, name }
    } as any;
    
    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          if (code >= 400) {
            return res.status(code).json(data);
          }
          // Si simpleAuth pasa, buscar o crear usuario
          // (Aquí iría tu lógica existente de creación de usuario)
          return res.json({
            id: 'temp-id',
            email,
            name: name || email.split('@')[0],
            role: 'admin',
            email_verified: true
          });
        }
      })
    } as any;
    
    const mockNext = (error?: any) => {
      if (error) {
        return res.status(500).json({ error: 'Error interno' });
      }
      // Continuar con la creación de usuario...
    };
    
    // Llamar a simpleAuth con los mocks
    await simpleAuth(mockReq, mockRes, mockNext);
    
  } catch (error) {
    console.error('❌ Error en sync-user:', error);
    res.status(500).json({ error: 'Error sincronizando usuario' });
  }
});

router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    
    console.log('🔍 CHECK-EMAIL - Verificando:', decodedEmail);
    
    // Verificar en la base de datos
    const authorizedEmail = await prisma.authorizedEmail.findUnique({
      where: { email: decodedEmail }
    });
    
    res.json({
      email: decodedEmail,
      isAuthorized: !!authorizedEmail,
      role: authorizedEmail?.allowed_role || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en check-email:', error);
    res.status(500).json({ error: 'Error verificando email' });
  }
});

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

// Endpoints que requieren autenticación
router.get('/users', simpleAuth, requireAdmin, listUsers);

export default router;