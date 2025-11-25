"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/auth/auth.routes.ts - ACTUALIZADO
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const simpleAuth_1 = require("../../middlewares/simpleAuth");
const router = (0, express_1.Router)();
// Endpoints públicos
router.get('/debug', auth_controller_1.debugAuth);
router.post('/sync-user', auth_controller_1.syncUser);
router.get('/user-info', auth_controller_1.getUserInfo);
// Endpoints que requieren autenticación
router.get('/users', simpleAuth_1.simpleAuth, auth_controller_1.listUsers);
exports.default = router;
