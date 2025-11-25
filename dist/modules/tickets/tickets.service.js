"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
// backend/src/modules/tickets/tickets.service.ts
const prisma_1 = require("../../lib/prisma");
class TicketsService {
    async createTicket(data) {
        return await prisma_1.prisma.ticket.create({
            data: {
                code: data.code,
                user_id: data.user_id,
                module_id: data.module_id,
                ticket_type_id: data.ticket_type_id,
                subject: data.subject,
                description: data.description,
                priority: data.priority,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                assigned_to_user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                module: true,
                ticket_type: true,
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        attachments: true
                    },
                    orderBy: { created_at: 'asc' }
                },
                attachments: true,
            }
        });
    }
    async getTickets(filters = {}) {
        const { status, priority, module_id, user_id, assigned_to, page = 1, limit = 10 } = filters;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (module_id)
            where.module_id = module_id;
        if (user_id)
            where.user_id = user_id;
        if (assigned_to)
            where.assigned_to = assigned_to;
        const skip = (page - 1) * limit;
        const [tickets, total] = await Promise.all([
            prisma_1.prisma.ticket.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    },
                    assigned_to_user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    },
                    module: true,
                    ticket_type: true,
                    messages: {
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    role: true,
                                }
                            }
                        },
                        orderBy: { created_at: 'asc' }
                    },
                    attachments: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma_1.prisma.ticket.count({ where })
        ]);
        return {
            tickets,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getTicketById(id) {
        const ticket = await prisma_1.prisma.ticket.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                assigned_to_user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                module: true,
                ticket_type: true,
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        attachments: true
                    },
                    orderBy: { created_at: 'asc' }
                },
                attachments: true,
            }
        });
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return ticket;
    }
    async getTicketByCode(code) {
        const ticket = await prisma_1.prisma.ticket.findUnique({
            where: { code },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                assigned_to_user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                module: true,
                ticket_type: true,
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        attachments: true
                    },
                    orderBy: { created_at: 'asc' }
                },
                attachments: true,
            }
        });
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        return ticket;
    }
    async updateTicket(id, data) {
        return await prisma_1.prisma.ticket.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                assigned_to_user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                module: true,
                ticket_type: true,
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                },
                attachments: true,
            }
        });
    }
    async addMessage(ticketId, body, senderId, isInternal = false) {
        const message = await prisma_1.prisma.ticketMessage.create({
            data: {
                body,
                sender_id: senderId,
                ticket_id: ticketId,
                is_internal: isInternal
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                },
                attachments: true
            }
        });
        // Actualizar timestamp del ticket
        await prisma_1.prisma.ticket.update({
            where: { id: ticketId },
            data: { updated_at: new Date() }
        });
        return message;
    }
    async getTicketStats() {
        const [total, open, in_progress, resolved, highPriority] = await Promise.all([
            prisma_1.prisma.ticket.count(),
            prisma_1.prisma.ticket.count({ where: { status: 'open' } }),
            prisma_1.prisma.ticket.count({ where: { status: 'in_progress' } }),
            prisma_1.prisma.ticket.count({ where: { status: 'resolved' } }),
            prisma_1.prisma.ticket.count({ where: { priority: { gte: 4 } } })
        ]);
        return {
            total,
            open,
            in_progress,
            resolved,
            highPriority
        };
    }
    async getModules() {
        return await prisma_1.prisma.module.findMany({
            orderBy: { id: 'asc' }
        });
    }
    async getTicketTypes() {
        return await prisma_1.prisma.ticketType.findMany({
            orderBy: { id: 'asc' }
        });
    }
}
exports.TicketsService = TicketsService;
