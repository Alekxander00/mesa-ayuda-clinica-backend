// prisma/seed.ts - ACTUALIZADO
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear módulos según tu especificación
  const modules = [
    { id: 1, key: 'HIS', label: 'HIS - Asistencial' },
    { id: 2, key: 'CRM', label: 'CRM - Administrativo' },
    { id: 3, key: 'ERP', label: 'ERP - Financiero' },
  ];

  for (const module of modules) {
    await prisma.module.upsert({
      where: { id: module.id },
      update: {},
      create: module,
    });
  }
  console.log('✅ Módulos creados');

  // Crear tipos de ticket según tu especificación
  const ticketTypes = [
    { id: 1, key: 'CONSULTA', label: 'Consulta' },
    { id: 2, key: 'PROBLEMA', label: 'Problema' },
    { id: 3, key: 'REQUERIMIENTO', label: 'Requerimiento' },
    { id: 4, key: 'CAPACITACION', label: 'Capacitación' },
    { id: 5, key: 'SUGERENCIA', label: 'Sugerencia' },
  ];

  for (const type of ticketTypes) {
    await prisma.ticketType.upsert({
      where: { id: type.id },
      update: {},
      create: type,
    });
  }
  console.log('✅ Tipos de ticket creados');

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });