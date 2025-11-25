// backend/verify-enums.js
const { UserRole, TicketStatus } = require('@prisma/client');

console.log('✅ UserRole:', Object.values(UserRole));
console.log('✅ TicketStatus:', Object.values(TicketStatus));
console.log('✅ Enums importados correctamente!');