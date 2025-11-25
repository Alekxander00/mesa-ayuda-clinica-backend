"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const PORT = process.env.PORT || 3001;
const server = app_1.default.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await prisma_1.prisma.$disconnect();
    server.close(() => {
        console.log('Process terminated');
    });
});
