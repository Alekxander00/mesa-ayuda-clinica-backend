// backend/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import path from 'path';
import process from 'process';

const currentDir = __dirname;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuración CORRECTA para Prisma
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Opciones correctas según la versión de Prisma
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
