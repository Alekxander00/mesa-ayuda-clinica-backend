"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = securityLogger;
exports.checkResourceOwnership = checkResourceOwnership;
// Middleware para logging de seguridad
function securityLogger(req, res, next) {
    const user = req.user;
    console.log('🔐 Security Log:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        user: user ? `${user.email} (${user.role})` : 'No autenticado',
        ip: req.ip || req.connection.remoteAddress
    });
    next();
}
// Middleware para verificar propiedad de recursos
function checkResourceOwnership(resourceType) {
    return async (req, res, next) => {
        const user = req.user;
        const resourceId = req.params.id;
        if (!user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        // Admin puede hacer cualquier cosa
        if (user.role === 'admin') {
            return next();
        }
        try {
            // Verificar si el usuario es dueño del recurso
            // Esto necesita ser implementado según el recurso específico
            console.log(`🔍 Verificando propiedad de ${resourceType} ${resourceId} para usuario ${user.email}`);
            // Por ahora, permitimos continuar y la verificación específica se hará en el controlador
            next();
        }
        catch (error) {
            console.error('Error en checkResourceOwnership:', error);
            res.status(500).json({ error: 'Error de verificación' });
        }
    };
}
