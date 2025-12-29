// backend/src/middlewares/simpleAuth.ts - VERSIÓN FINAL CON BLOQUEO
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function simpleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userEmail = req.headers['x-user-email'] as string;

    console.log('🔐 SIMPLE AUTH - Verificando acceso para:', userEmail);

    if (!userEmail) {
      console.log('❌ NO AUTORIZADO: Falta header x-user-email');
      return res.status(401).json({ 
        error: 'Acceso no autorizado',
        message: 'Se requiere autenticación',
        code: 'AUTH_HEADER_MISSING'
      });
    }

    // 1. VERIFICAR SI EL CORREO ESTÁ AUTORIZADO
    const authorizedEmail = await prisma.authorizedEmail.findUnique({
      where: { email: userEmail }
    });

    // 2. SI NO ESTÁ AUTORIZADO, BLOQUEAR COMPLETAMENTE
    if (!authorizedEmail) {
      console.log(`🚫 ACCESO DENEGADO: ${userEmail} no está en la lista de autorizados`);
      
      // NO CREAR USUARIO, NO PERMITIR NADA
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'Tu correo electrónico no está autorizado para usar este sistema.',
        details: 'Contacta al administrador para solicitar acceso.',
        email: userEmail,
        code: 'EMAIL_NOT_AUTHORIZED'
      });
    }

    console.log('✅ Correo autorizado:', userEmail, 'Rol:', authorizedEmail.allowed_role);

    // 3. Buscar o crear usuario (solo si está autorizado)
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

    if (!user) {
      // Crear usuario con el rol autorizado
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0],
          password_hash: 'oauth-google',
          role: authorizedEmail.allowed_role,
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
      console.log('🆕 Usuario creado automáticamente');
    }

    // 4. Adjuntar usuario al request
    (req as any).user = user;
    console.log('✅ Usuario autenticado:', user.email, 'Rol:', user.role);
    next();

  } catch (error) {
    console.error('❌ Error crítico en autenticación:', error);
    res.status(500).json({ 
      error: 'Error interno de autenticación',
      code: 'AUTH_INTERNAL_ERROR'
    });
  }
}