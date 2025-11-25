"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/attachments/attachments.routes.ts - ARCHIVO COMPLETO
const express_1 = require("express");
const attachments_controller_1 = require("./attachments.controller");
const upload_1 = require("../../middlewares/upload");
const simpleAuth_1 = require("../../middlewares/simpleAuth");
const router = (0, express_1.Router)();
// ✅ RUTAS PÚBLICAS (requieren header x-user-email)
router.get('/:id/view', simpleAuth_1.simpleAuth, attachments_controller_1.getImageWithAuth); // ← CAMBIAR POR getImageWithAuth
router.get('/:id/download', simpleAuth_1.simpleAuth, attachments_controller_1.downloadAttachment);
// RUTAS PARA GESTIÓN DE ADJUNTOS
router.get('/tickets/:id/attachments', simpleAuth_1.simpleAuth, attachments_controller_1.getTicketAttachments);
router.post('/tickets/:id/attachments', simpleAuth_1.simpleAuth, upload_1.upload.array('files', 10), upload_1.handleUploadError, attachments_controller_1.uploadAttachments);
exports.default = router;
