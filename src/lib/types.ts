// backend/src/lib/types.ts
import { UserRole } from '@prisma/client';
import path from 'path';
import process from 'process';
const currentDir = __dirname;

// Helper para convertir strings a UserRole de forma segura
export function toUserRole(role: string): UserRole {
  const validRoles = Object.values(UserRole);
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  throw new Error(`Rol no válido: ${role}. Los roles permitidos son: ${validRoles.join(', ')}`);
}

// Tipo para datos de creación de usuario que acepta strings pero los convierte
export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// Tipo para datos de actualización de usuario
export interface UpdateUserInput {
  name?: string;
  role?: string;
  email_verified?: boolean;
}