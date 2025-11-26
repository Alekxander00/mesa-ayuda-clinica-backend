// backend/src/modules/users/users.service.ts
import { prisma } from '../../lib/prisma';
import path from 'path';
import process from 'process';

// Para __dirname, usa:
const currentDir = __dirname;
export class UsersService {
  async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async updateUser(id: string, updateData: {
    name?: string;
    role?: string;
    email_verified?: boolean;
  }) {
    // Validar que el role sea válido
    if (updateData.role) {
      const validRoles = ['user', 'technician', 'admin', 'auditor'];
      if (!validRoles.includes(updateData.role)) {
        throw new Error(`Rol no válido. Los roles permitidos son: ${validRoles.join(', ')}`);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        role: updateData.role as any  // ← CORREGIDO: agregar 'as any'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
        created_at: true,
        updated_at: true
      }
    });

    return user;
  }

  async getUsersStats() {
    const [total, admins, technicians, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'technician' } }),
      prisma.user.count({ where: { role: 'user' } })
    ]);

    return {
      total,
      admins,
      technicians,
      users
    };
  }
}