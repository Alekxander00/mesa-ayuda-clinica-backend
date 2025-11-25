"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = syncUser;
exports.getUserInfo = getUserInfo;
exports.listUsers = listUsers;
exports.debugAuth = debugAuth;
const prisma_1 = require("../../lib/prisma");
// Sincronizar usuario con el backend
async function syncUser(req, res) {
    try {
        const { email, name } = req.body;
        console.log('🔐 SYNC USER - Sincronizando usuario:', { email, name });
        if (!email) {
            return res.status(400).json({ error: 'Email es requerido' });
        }
        // Buscar usuario existente
        let user = await prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                email_verified: true,
            },
        });
        // Si el usuario no existe, crearlo con sistema de roles
        if (!user) {
            console.log('🆕 SYNC USER: Usuario no existe, creando nuevo...');
            const userCount = await prisma_1.prisma.user.count();
            let defaultRole = 'user';
            if (userCount === 0) {
                defaultRole = 'admin';
                console.log('👑 Primer usuario - Asignando rol: admin');
            }
            else if (userCount === 1) {
                defaultRole = 'technician';
                console.log('🔧 Segundo usuario - Asignando rol: technician');
            }
            else if (email.includes('admin') || email.includes('administrador')) {
                defaultRole = 'admin';
                console.log('👑 Usuario admin detectado por email');
            }
            else if (email.includes('tech') || email.includes('soporte') || email.includes('tecnico')) {
                defaultRole = 'technician';
                console.log('🔧 Usuario technician detectado por email');
            }
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    name: name || email.split('@')[0],
                    password_hash: 'oauth-google',
                    role: defaultRole,
                    email_verified: true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    email_verified: true,
                },
            });
            console.log('✅ SYNC USER: Nuevo usuario creado:', user);
        }
        else {
            console.log('✅ SYNC USER: Usuario existente encontrado:', user);
        }
        res.json(user);
    }
    catch (error) {
        console.error('❌ Error en syncUser:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
// Obtener información del usuario
async function getUserInfo(req, res) {
    try {
        const { email } = req.query;
        console.log('🔐 GET USER INFO - Buscando:', email);
        if (!email) {
            return res.status(400).json({ error: 'Email es requerido' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                email_verified: true,
                created_at: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        console.log('✅ GET USER INFO: Usuario encontrado:', user);
        res.json(user);
    }
    catch (error) {
        console.error('❌ Error en getUserInfo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
// Listar todos los usuarios (solo para admin)
async function listUsers(req, res) {
    try {
        const user = req.user;
        // Solo admin puede ver todos los usuarios
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'No tienes permisos para ver usuarios' });
        }
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                email_verified: true,
                created_at: true,
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({
            total: users.length,
            users: users
        });
    }
    catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ error: 'Error interno' });
    }
}
async function debugAuth(req, res) {
    try {
        const userEmail = req.headers['x-user-email'];
        console.log('🔐 DEBUG AUTH - Iniciando...');
        console.log('📧 Email del header:', userEmail);
        console.log('📨 Todos los headers:', req.headers);
        if (!userEmail) {
            return res.status(400).json({
                error: 'No hay header x-user-email',
                headers: req.headers
            });
        }
        // Verificar si el usuario existe
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: userEmail },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
            },
        });
        const totalUsers = await prisma_1.prisma.user.count();
        res.json({
            headerReceived: userEmail,
            userExists: !!user,
            user: user,
            totalUsers: totalUsers,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Error en debugAuth:', error);
        res.status(500).json({ error: 'Error en debug' });
    }
}
