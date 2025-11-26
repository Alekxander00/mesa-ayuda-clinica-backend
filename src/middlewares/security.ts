// backend/src/middlewares/security.ts - NUEVO ARCHIVO
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import process from 'process';

const currentDir = __dirname;
// Middleware para logging de seguridad
export function securityLogger(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  console.log('🔐 Security Log:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    user: user ? `${user.email} (${user.role})` : 'No autenticado',
    ip: req.ip || req.connection.remoteAddress
  });
  
  next();
}

// Middleware para verificar propiedad de recursos
export function checkResourceOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const resourceId = req.params.id;

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Admin puede hacer cualquier cosa
    if (user.role === 'admin') {
      return next();
    }

    try {
      // Verificar si el usuario es dueño del recurso
      // Esto necesita ser implementado según el recurso específico
      console.log(`🔍 Verificando propiedad de ${resourceType} ${resourceId} para usuario ${user.email}`);
      
      // Por ahora, permitimos continuar y la verificación específica se hará en el controlador
      next();
    } catch (error) {
      console.error('Error en checkResourceOwnership:', error);
      res.status(500).json({ error: 'Error de verificación' });
    }
  };
}