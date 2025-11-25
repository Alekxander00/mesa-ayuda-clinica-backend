// backend/src/modules/attachments/attachments.routes.ts - ARCHIVO COMPLETO
import { Router } from 'express';
import { 
  getTicketAttachments, 
  uploadAttachments, 
  downloadAttachment,
  viewImage,
  getImageWithAuth  // ← AGREGAR ESTO
} from './attachments.controller';
import { upload, handleUploadError } from '../../middlewares/upload';
import { simpleAuth } from '../../middlewares/simpleAuth';

const router = Router();

// ✅ RUTAS PÚBLICAS (requieren header x-user-email)
router.get('/:id/view', simpleAuth, getImageWithAuth);  // ← CAMBIAR POR getImageWithAuth
router.get('/:id/download', simpleAuth, downloadAttachment);

// RUTAS PARA GESTIÓN DE ADJUNTOS
router.get('/tickets/:id/attachments', simpleAuth, getTicketAttachments);
router.post('/tickets/:id/attachments', simpleAuth, upload.array('files', 10), handleUploadError, uploadAttachments);

export default router;