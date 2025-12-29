// backend/src/modules/auth/auth.controller.ts - MODIFICADO
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { EmailAuthService } from '../../service/emailAuth.service';

const emailAuthService = new EmailAuthService();

// Sincronizar usuario con el backend - MODIFICADO
export async function syncUser(req: Request, res: Response) {
  try {
    const { email, name } = req.body;

    console.log('🔐 SYNC USER - Sincronizando usuario:', { email, name });

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // 1. Verificar si el correo está autorizado
    const isAuthorized = await emailAuthService.isEmailAuthorized(email);
    
    if (!isAuthorized) {
      console.log(`❌ SYNC USER: Correo no autorizado: ${email}`);
      return res.status(403).json({ 
        error: 'Acceso no autorizado',
        message: 'Tu correo no está en la lista de correos permitidos',
        email: email
      });
    }

    // 2. Obtener rol autorizado
    const authorizedRole = await emailAuthService.getAuthorizedRole(email);
    
    // 3. Buscar usuario existente
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

    // 4. Si no existe, crearlo con el rol autorizado
    if (!user) {
      console.log('🆕 SYNC USER: Creando nuevo usuario con rol autorizado:', authorizedRole);
      
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password_hash: 'oauth-google',
          role: authorizedRole as any || 'user', // Usar rol autorizado o 'user' por defecto
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

      console.log('✅ SYNC USER: Nuevo usuario creado:', user);
    } else {
      console.log('✅ SYNC USER: Usuario existente encontrado:', user);
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Error en syncUser:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Obtener información del usuario
export async function getUserInfo(req: Request, res: Response) {
  try {
    const { email } = req.query;

    console.log('🔐 GET USER INFO - Buscando:', email);

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
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ GET USER INFO: Usuario encontrado:', user);
    res.json(user);
  } catch (error) {
    console.error('❌ Error en getUserInfo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Listar todos los usuarios (solo para admin)
export async function listUsers(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    // Solo admin puede ver todos los usuarios
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permisos para ver usuarios' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      total: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error interno' });
  }
}

export async function debugAuth(req: Request, res: Response) {
  try {
    const userEmail = req.headers['x-user-email'] as string;
    
    console.log('🔐 DEBUG AUTH - Iniciando...');
    console.log('📧 Email del header:', userEmail);
    console.log('📨 Todos los headers:', req.headers);

    if (!userEmail) {
      return res.status(400).json({ 
        error: 'No hay header x-user-email',
        headers: req.headers 
      });
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        created_at: true,
      },
    });

    const totalUsers = await prisma.user.count();

    res.json({
      headerReceived: userEmail,
      userExists: !!user,
      user: user,
      totalUsers: totalUsers,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en debugAuth:', error);
    res.status(500).json({ error: 'Error en debug' });
  }
}