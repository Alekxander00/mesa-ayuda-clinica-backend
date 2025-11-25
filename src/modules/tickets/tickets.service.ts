// backend/src/modules/tickets/tickets.service.ts
import { prisma } from '../../lib/prisma';
// Define tus propios tipos localmente
type UserRole = 'user' | 'technician' | 'admin' | 'auditor';
type TicketStatus = 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface CreateTicketData {
  code: string;
  user_id: string;
  module_id: number;
  ticket_type_id: number;
  subject?: string;
  description: string;
  priority?: number;
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  status?: TicketStatus;
  assigned_to?: string;
  priority?: number;
  module_id?: number;
  ticket_type_id?: number;
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: number;
  module_id?: number;
  user_id?: string;
  assigned_to?: string;
  page?: number;
  limit?: number;
}

export class TicketsService {
  async createTicket(data: CreateTicketData) {
    return await prisma.ticket.create({
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

  async getTickets(filters: TicketFilters = {}) {
    const {
      status,
      priority,
      module_id,
      user_id,
      assigned_to,
      page = 1,
      limit = 10
    } = filters;

    const where: any = {};
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (module_id) where.module_id = module_id;
    if (user_id) where.user_id = user_id;
    if (assigned_to) where.assigned_to = assigned_to;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
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
      prisma.ticket.count({ where })
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

  async getTicketById(id: string) {
    const ticket = await prisma.ticket.findUnique({
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

  async getTicketByCode(code: string) {
    const ticket = await prisma.ticket.findUnique({
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

  async updateTicket(id: string, data: UpdateTicketData) {
    return await prisma.ticket.update({
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

  async addMessage(ticketId: string, body: string, senderId: string, isInternal: boolean = false) {
    const message = await prisma.ticketMessage.create({
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
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { updated_at: new Date() }
    });

    return message;
  }

  async getTicketStats() {
    const [
      total,
      open,
      in_progress,
      resolved,
      highPriority
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'open' } }),
      prisma.ticket.count({ where: { status: 'in_progress' } }),
      prisma.ticket.count({ where: { status: 'resolved' } }),
      prisma.ticket.count({ where: { priority: { gte: 4 } } })
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
    return await prisma.module.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async getTicketTypes() {
    return await prisma.ticketType.findMany({
      orderBy: { id: 'asc' }
    });
  }
}