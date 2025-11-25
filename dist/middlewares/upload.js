"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.upload = void 0;
// backend/src/middlewares/upload.ts - CONFIGURACIÓN MULTER COMPLETA
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Asegurar que la carpeta uploads existe
const uploadsDir = 'uploads';
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Carpeta uploads creada');
}
// Configurar almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // ✅ Usar path.join para rutas consistentes
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
        // ✅ Guardar solo el nombre del archivo, no la ruta completa
        cb(null, safeName + '-' + uniqueSuffix + ext);
    }
});
// Validar tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/avi',
        'audio/mpeg',
        'audio/wav',
        'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
};
// Configurar multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB límite
    },
    fileFilter: fileFilter
});
// Middleware para manejar errores de multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Demasiados archivos o campo incorrecto' });
        }
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
};
exports.handleUploadError = handleUploadError;
