// backend/src/middlewares/auth.ts - CORREGIDO
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function verifyUserHeader(req: Request, res: Response, next: NextFunction) {
  try {
    // ✅ ESTRATEGIA CORREGIDA: Solo usar x-user-email
    const userEmail = req.headers['x-user-email'] as string;
    
    console.log('🔐 Auth Headers Received:', {
      'x-user-email': userEmail,
      'authorization': req.headers['authorization']
    });
    
    if (!userEmail) {
      return res.status(401).json({ error: 'Authentication headers missing: x-user-email required' });
    }
    
    // Verificar usuario en base de datos por EMAIL
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      console.log('❌ User not found for email:', userEmail);
      return res.status(401).json({ error: 'User not found in database' });
    }
    
    console.log('✅ User authenticated:', user.email);
    // Adjuntar usuario al request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('🔴 Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}