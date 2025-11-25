"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getUserStats = getUserStats;
const prisma_1 = require("../../lib/prisma");
// ✅ CORREGIDO: Todas las funciones exportadas
async function getUsers(req, res) {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUser(req, res) {
    try {
        const { id } = req.params;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                name,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
                updated_at: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getUserStats(req, res) {
    try {
        const totalUsers = await prisma_1.prisma.user.count();
        const usersByRole = await prisma_1.prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true,
            },
        });
        res.json({
            totalUsers,
            usersByRole,
        });
    }
    catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
