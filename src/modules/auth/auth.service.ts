// backend/src/modules/auth/auth.service.ts
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import process from 'process';
const currentDir = __dirname;

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: user.email_verified
      }
    };
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Validar role si se proporciona
    if (userData.role) {
      const validRoles = ['user', 'technician', 'admin', 'auditor'];
      if (!validRoles.includes(userData.role)) {
        throw new Error(`Rol no válido. Los roles permitidos son: ${validRoles.join(', ')}`);
      }
    }

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password_hash: hashedPassword,
        name: userData.name,
        role: (userData.role as any) || 'user'  // ← CORREGIDO: agregar 'as any'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        email_verified: true,
        created_at: true
      }
    });

    return user;
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          email_verified: true
        }
      });

      return user;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
}