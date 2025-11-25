"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
// backend/src/modules/users/users.service.ts
const prisma_1 = require("../../lib/prisma");
class UsersService {
    async getUsers() {
        return await prisma_1.prisma.user.findMany({
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
    async getUserById(id) {
        const user = await prisma_1.prisma.user.findUnique({
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
    async updateUser(id, updateData) {
        // Validar que el role sea válido
        if (updateData.role) {
            const validRoles = ['user', 'technician', 'admin', 'auditor'];
            if (!validRoles.includes(updateData.role)) {
                throw new Error(`Rol no válido. Los roles permitidos son: ${validRoles.join(', ')}`);
            }
        }
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                ...updateData,
                role: updateData.role // ← CORREGIDO: agregar 'as any'
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
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({ where: { role: 'admin' } }),
            prisma_1.prisma.user.count({ where: { role: 'technician' } }),
            prisma_1.prisma.user.count({ where: { role: 'user' } })
        ]);
        return {
            total,
            admins,
            technicians,
            users
        };
    }
}
exports.UsersService = UsersService;
