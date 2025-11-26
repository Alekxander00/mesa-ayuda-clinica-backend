// backend/src/middlewares/upload.ts - CONFIGURACIÓN MULTER COMPLETA
import multer from 'multer';
import path from 'path';
import process from 'process';
import { Request } from 'express';
import fs from 'fs';

const currentDir = __dirname;
// Asegurar que la carpeta uploads existe
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Carpeta uploads creada');
}

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
      // ✅ Usar path.join para rutas consistentes
      const uploadsDir = path.join(process.cwd(), 'uploads');
      cb(null, uploadsDir);
    },
    filename: (req: Request, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
      // ✅ Guardar solo el nombre del archivo, no la ruta completa
      cb(null, safeName + '-' + uniqueSuffix + ext);
    }
  });

  

// Validar tipos de archivo
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
  }
};

// Configurar multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: fileFilter
});

// Middleware para manejar errores de multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
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