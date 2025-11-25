"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserRole = toUserRole;
// backend/src/lib/types.ts
const client_1 = require("@prisma/client");
// Helper para convertir strings a UserRole de forma segura
function toUserRole(role) {
    const validRoles = Object.values(client_1.UserRole);
    if (validRoles.includes(role)) {
        return role;
    }
    throw new Error(`Rol no válido: ${role}. Los roles permitidos son: ${validRoles.join(', ')}`);
}
