// backend/src/middlewares/simpleAuth.ts - MEJORADO CON SISTEMA DE ROLES
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function simpleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userEmail = req.headers['x-user-email'] as string;

    console.log('🔐 SIMPLE AUTH - Iniciando...');
    console.log('📧 Email del header:', userEmail);

    if (!userEmail) {
      console.log('❌ simpleAuth: No hay header x-user-email');
      return res.status(401).json({ error: 'No autenticado - falta email' });
    }

    console.log('🔍 Buscando usuario en BD:', userEmail);

    // Buscar usuario existente
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
      },
    });

    console.log('👤 Usuario encontrado:', user);

    // Si el usuario no existe, CREARLO automáticamente con sistema de roles
    if (!user) {
      console.log('🆕 simpleAuth: Usuario no existe, creando nuevo...');
      
      // SISTEMA DE ROLES AUTOMÁTICO MEJORADO
      const userCount = await prisma.user.count();
      let defaultRole: 'user' | 'technician' | 'admin' = 'user';

      // Primer usuario: admin
      if (userCount === 0) {
        defaultRole = 'admin';
        console.log('👑 Primer usuario - Asignando rol: admin');
      } 
      // Segundo usuario: technician  
      else if (userCount === 1) {
        defaultRole = 'technician';
        console.log('🔧 Segundo usuario - Asignando rol: technician');
      }
      // Emails específicos pueden ser admin (para testing)
      else if (userEmail.includes('admin') || userEmail.includes('administrador')) {
        defaultRole = 'admin';
        console.log('👑 Usuario admin detectado por email');
      }
      // Emails específicos pueden ser technician
      else if (userEmail.includes('tech') || userEmail.includes('soporte') || userEmail.includes('tecnico')) {
        defaultRole = 'technician';
        console.log('🔧 Usuario technician detectado por email');
      }
      // Por defecto: user
      else {
        console.log('👤 Usuario normal - Asignando rol: user');
      }

      try {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userEmail.split('@')[0], // Nombre por defecto
            password_hash: 'oauth-google', // Placeholder para OAuth
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

        console.log('✅ simpleAuth: Nuevo usuario creado:', user);
      } catch (createError) {
        console.error('❌ Error creando usuario:', createError);
        return res.status(500).json({ error: 'Error creando usuario' });
      }
    } else {
      console.log('✅ simpleAuth: Usuario existente encontrado - Rol:', user.role);
    }

    // Agregar usuario al request
    (req as any).user = user;
    console.log('✅ simpleAuth: Usuario autenticado:', user.email, 'Rol:', user.role);
    next();

  } catch (error) {
    console.error('❌ Error crítico en simpleAuth:', error);
    res.status(500).json({ error: 'Error interno de autenticación' });
  }
}