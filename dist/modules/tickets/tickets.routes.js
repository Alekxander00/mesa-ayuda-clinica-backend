"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/tickets/tickets.routes.ts - ACTUALIZADO
const express_1 = require("express");
const tickets_controller_1 = require("./tickets.controller");
const attachments_controller_1 = require("../attachments/attachments.controller");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// Rutas de tickets
router.get('/', tickets_controller_1.getTickets);
router.get('/:id', tickets_controller_1.getTicket);
router.post('/', tickets_controller_1.createTicket);
router.put('/:id', tickets_controller_1.updateTicket);
router.delete('/:id', tickets_controller_1.deleteTicket);
// Rutas de mensajes
router.get('/:id/messages', tickets_controller_1.getTicketMessages);
router.post('/:id/messages', tickets_controller_1.addMessageToTicket);
// ✅ RUTAS DE ADJUNTOS CORREGIDAS
router.get('/:id/attachments', attachments_controller_1.getTicketAttachments);
router.post('/:id/attachments', upload_1.upload.array('files', 5), upload_1.handleUploadError, attachments_controller_1.uploadAttachments);
// ✅ RUTAS DE ARCHIVOS INDIVIDUALES
router.get('/attachments/:id/download', attachments_controller_1.downloadAttachment);
router.get('/attachments/:id/view', attachments_controller_1.viewImage); // ✅ NUEVO ENDPOINT PARA VISUALIZACIÓN
exports.default = router;
