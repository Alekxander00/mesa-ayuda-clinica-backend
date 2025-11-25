"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// backend/src/modules/auth/auth.service.ts
const prisma_1 = require("../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
    async register(userData) {
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: userData.email }
        });
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        // Validar role si se proporciona
        if (userData.role) {
            const validRoles = ['user', 'technician', 'admin', 'auditor'];
            if (!validRoles.includes(userData.role)) {
                throw new Error(`Rol no válido. Los roles permitidos son: ${validRoles.join(', ')}`);
            }
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                email: userData.email,
                password_hash: hashedPassword,
                name: userData.name,
                role: userData.role || 'user' // ← CORREGIDO: agregar 'as any'
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
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await prisma_1.prisma.user.findUnique({
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
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
}
exports.AuthService = AuthService;
