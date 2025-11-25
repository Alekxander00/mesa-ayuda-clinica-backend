"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/index.ts - CORREGIDO
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const tickets_routes_1 = __importDefault(require("../modules/tickets/tickets.routes"));
const simpleAuth_1 = require("../middlewares/simpleAuth"); // ✅ IMPORTAR MIDDLEWARE
const router = (0, express_1.Router)();
// Rutas públicas (sin autenticación)
router.use('/api/auth', auth_1.default);
// ✅ APLICAR MIDDLEWARE A TODAS LAS RUTAS DE TICKETS
router.use('/api/tickets', simpleAuth_1.simpleAuth, tickets_routes_1.default);
exports.default = router;
