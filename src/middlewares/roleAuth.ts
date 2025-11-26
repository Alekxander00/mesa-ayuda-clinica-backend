// backend/src/middlewares/roleAuth.ts - NUEVO ARCHIVO
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import process from 'process';

const currentDir = __dirname;
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(user.role)) {
      console.log(`🚫 Acceso denegado: ${user.email} (${user.role}) intentó acceder a recurso para roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        requiredRoles: allowedRoles,
        userRole: user.role
      });
    }

    console.log(`✅ Acceso permitido: ${user.email} (${user.role})`);
    next();
  };
}

// Middlewares predefinidos
export const requireAdmin = requireRole(['admin']);
export const requireTechnician = requireRole(['technician', 'admin']);
export const requireAuditor = requireRole(['auditor', 'admin']);
export const requireAnyAuthenticated = requireRole(['user', 'technician', 'admin', 'auditor']);