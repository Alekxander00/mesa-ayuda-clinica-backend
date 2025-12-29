// backend/src/services/emailAuth.service.ts - NUEVO ARCHIVO
import { prisma } from '../lib/prisma';

export class EmailAuthService {
  // Verificar si un correo está autorizado
  async isEmailAuthorized(email: string): Promise<boolean> {
    const authorized = await prisma.authorizedEmail.findUnique({
      where: { email }
    });
    return !!authorized;
  }

  // Obtener rol autorizado para un correo
  async getAuthorizedRole(email: string): Promise<string | null> {
    const authorized = await prisma.authorizedEmail.findUnique({
      where: { email }
    });
    return authorized ? authorized.allowed_role : null;
  }

  // Agregar correo autorizado (solo admin)
  async addAuthorizedEmail(email: string, role: string = 'user'): Promise<any> {
    // Validar rol
    const validRoles = ['user', 'technician', 'admin', 'auditor'];
    if (!validRoles.includes(role)) {
      throw new Error(`Rol inválido. Roles permitidos: ${validRoles.join(', ')}`);
    }

    return await prisma.authorizedEmail.create({
      data: {
        email,
        allowed_role: role as any
      }
    });
  }

  // Eliminar correo autorizado (solo admin)
  async removeAuthorizedEmail(email: string): Promise<any> {
    return await prisma.authorizedEmail.delete({
      where: { email }
    });
  }

  // Listar todos los correos autorizados
  async listAuthorizedEmails(): Promise<any[]> {
    return await prisma.authorizedEmail.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}