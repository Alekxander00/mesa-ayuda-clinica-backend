"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyAuthenticated = exports.requireAuditor = exports.requireTechnician = exports.requireAdmin = void 0;
exports.requireRole = requireRole;
function requireRole(allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }
        if (!allowedRoles.includes(user.role)) {
            console.log(`🚫 Acceso denegado: ${user.email} (${user.role}) intentó acceder a recurso para roles: ${allowedRoles.join(', ')}`);
            return res.status(403).json({
                error: 'No tienes permisos para realizar esta acción',
                requiredRoles: allowedRoles,
                userRole: user.role
            });
        }
        console.log(`✅ Acceso permitido: ${user.email} (${user.role})`);
        next();
    };
}
// Middlewares predefinidos
exports.requireAdmin = requireRole(['admin']);
exports.requireTechnician = requireRole(['technician', 'admin']);
exports.requireAuditor = requireRole(['auditor', 'admin']);
exports.requireAnyAuthenticated = requireRole(['user', 'technician', 'admin', 'auditor']);
