// backend/src/modules/tickets/tickets.routes.ts - ACTUALIZADO
import { Router } from 'express';
import path from 'path';
import process from 'process';
import { 
  getTickets, 
  getTicket, 
  createTicket, 
  updateTicket, 
  deleteTicket,
  getTicketMessages,
  addMessageToTicket
} from './tickets.controller';
import { 
  getTicketAttachments, 
  uploadAttachments, 
  downloadAttachment,
  viewImage  // ✅ AGREGAR ESTA IMPORTACIÓN
} from '../attachments/attachments.controller';
import { upload, handleUploadError } from '../../middlewares/upload';

const currentDir = __dirname;
const router = Router();

// Rutas de tickets
router.get('/', getTickets);
router.get('/:id', getTicket);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

// Rutas de mensajes
router.get('/:id/messages', getTicketMessages);
router.post('/:id/messages', addMessageToTicket);

// ✅ RUTAS DE ADJUNTOS CORREGIDAS
router.get('/:id/attachments', getTicketAttachments);
router.post('/:id/attachments', 
  upload.array('files', 5),
  handleUploadError,
  uploadAttachments
);

// ✅ RUTAS DE ARCHIVOS INDIVIDUALES
router.get('/attachments/:id/download', downloadAttachment);
router.get('/attachments/:id/view', viewImage); // ✅ NUEVO ENDPOINT PARA VISUALIZACIÓN

export default router;