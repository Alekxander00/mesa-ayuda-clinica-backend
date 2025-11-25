"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/users/users.routes.ts - CON ROLES
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const roleAuth_1 = require("../../middlewares/roleAuth");
const router = (0, express_1.Router)();
// Solo admin puede gestionar usuarios
router.get('/', roleAuth_1.requireAdmin, users_controller_1.getUsers);
router.get('/stats', roleAuth_1.requireAdmin, users_controller_1.getUserStats);
router.get('/:id', roleAuth_1.requireAdmin, users_controller_1.getUser);
router.put('/:id', roleAuth_1.requireAdmin, users_controller_1.updateUser);
router.delete('/:id', roleAuth_1.requireAdmin, users_controller_1.deleteUser);
exports.default = router;
