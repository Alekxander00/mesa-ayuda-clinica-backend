// backend/prisma/seed.js
const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
import path from 'path';
import process from 'process';


const currentDir = __dirname;
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Módulos del sistema
    const modules = [
      { id: 1, key: 'his', label: 'Historia Clínica' },
      { id: 2, key: 'citas', label: 'Gestión de Citas' },
      { id: 3, key: 'farmacia', label: 'Farmacia' },
      { id: 4, key: 'laboratorio', label: 'Laboratorio' },
      { id: 5, key: 'imagenes', label: 'Imágenes Diagnósticas' },
      { id: 6, key: 'urgencias', label: 'Urgencias' },
      { id: 7, key: 'quirofano', label: 'Quirófano' },
      { id: 8, key: 'facturacion', label: 'Facturación' },
    ];

    // Tipos de ticket
    const ticketTypes = [
      { id: 1, key: 'incidente', label: 'Incidente' },
      { id: 2, key: 'solicitud', label: 'Solicitud de Servicio' },
      { id: 3, key: 'problema', label: 'Problema' },
      { id: 4, key: 'mejora', label: 'Solicitud de Mejora' },
    ];

    // Insertar módulos
    for (const module of modules) {
      await prisma.module.upsert({
        where: { id: module.id },
        update: module,
        create: module,
      });
    }

    // Insertar tipos de ticket
    for (const type of ticketTypes) {
      await prisma.ticketType.upsert({
        where: { id: type.id },
        update: type,
        create: type,
      });
    }

    // Crear usuario administrador por defecto
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    await prisma.user.upsert({
      where: { email: 'admin@clinica.com' },
      update: {},
      create: {
        email: 'admin@clinica.com',
        password_hash: hashedPassword,
        name: 'Administrador del Sistema',
        role: UserRole.admin,
        email_verified: true,
      },
    });

    // Crear usuario técnico de ejemplo
    await prisma.user.upsert({
      where: { email: 'tecnico@clinica.com' },
      update: {},
      create: {
        email: 'tecnico@clinica.com',
        password_hash: hashedPassword,
        name: 'Técnico de Soporte',
        role: UserRole.technician,
        email_verified: true,
      },
    });

    // Crear usuario regular de ejemplo
    await prisma.user.upsert({
      where: { email: 'usuario@clinica.com' },
      update: {},
      create: {
        email: 'usuario@clinica.com',
        password_hash: hashedPassword,
        name: 'Usuario Regular',
        role: UserRole.user,
        email_verified: true,
      },
    });

    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });