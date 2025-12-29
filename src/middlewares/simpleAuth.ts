// backend/src/middlewares/simpleAuth.ts - MODIFICADO CON VERIFICACIÓN DE CORREOS AUTORIZADOS
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import path from 'path';
import process from 'process';

const currentDir = __dirname;

export async function simpleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const userEmail = req.headers['x-user-email'] as string;

    console.log('🔐 SIMPLE AUTH - Iniciando...');
    console.log('📧 Email del header:', userEmail);

    if (!userEmail) {
      console.log('❌ simpleAuth: No hay header x-user-email');
      return res.status(401).json({ error: 'No autenticado - falta email' });
    }

    console.log('🔍 Verificando si el correo está autorizado...');

    // 1. PRIMERO: Verificar si el correo está en la lista de autorizados
    const authorizedEmail = await prisma.authorizedEmail.findUnique({
      where: { email: userEmail }
    });

    if (!authorizedEmail) {
      console.log(`❌ Correo NO autorizado: ${userEmail}`);
      return res.status(403).json({ 
        error: 'Acceso no autorizado',
        message: 'Tu correo no está en la lista de correos permitidos para este sistema',
        email: userEmail
      });
    }

    console.log('✅ Correo autorizado encontrado, rol asignado:', authorizedEmail.allowed_role);

    // 2. Buscar usuario existente
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

    // 3. Si el usuario no existe, CREARLO con el rol de la lista autorizada
    if (!user) {
      console.log('🆕 simpleAuth: Usuario no existe, creando nuevo con rol autorizado...');
      
      try {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userEmail.split('@')[0], // Nombre por defecto
            password_hash: 'oauth-google', // Placeholder para OAuth
            role: authorizedEmail.allowed_role, // Usar el rol de la lista autorizada
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

        console.log('✅ simpleAuth: Nuevo usuario creado con rol autorizado:', user.role);
      } catch (createError) {
        console.error('❌ Error creando usuario:', createError);
        return res.status(500).json({ error: 'Error creando usuario' });
      }
    } else {
      console.log('✅ simpleAuth: Usuario existente encontrado - Rol:', user.role);
    }

    // 4. Agregar usuario al request
    (req as any).user = user;
    console.log('✅ simpleAuth: Usuario autenticado:', user.email, 'Rol:', user.role);
    next();

  } catch (error) {
    console.error('❌ Error crítico en simpleAuth:', error);
    res.status(500).json({ error: 'Error interno de autenticación' });
  }
}