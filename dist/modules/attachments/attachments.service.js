"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
// backend/src/modules/attachments/attachments.service.ts
const prisma_1 = require("../../lib/prisma");
class AttachmentsService {
    async createAttachment(attachmentData) {
        return await prisma_1.prisma.attachment.create({
            data: attachmentData,
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                ticket: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                message: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
    }
    async getAttachmentsByTicket(ticketId) {
        return await prisma_1.prisma.attachment.findMany({
            where: { ticket_id: ticketId },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }
    async getAttachmentById(id) {
        const attachment = await prisma_1.prisma.attachment.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                ticket: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                message: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!attachment) {
            throw new Error('Archivo no encontrado');
        }
        return attachment;
    }
    async deleteAttachment(id) {
        await prisma_1.prisma.attachment.delete({
            where: { id }
        });
    }
}
exports.AttachmentsService = AttachmentsService;
