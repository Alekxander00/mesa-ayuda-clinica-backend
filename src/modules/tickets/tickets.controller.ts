// backend/src/modules/tickets/tickets.controller.ts - CORREGIDO
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function getTickets(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
  
      console.log('📋 Obteniendo tickets para usuario:', user.email, 'Rol:', user.role);
  
      // ✅ CORREGIDO: Filtrar tickets según el rol del usuario
      let whereCondition = {};
  
      if (user.role === 'user') {
        // Usuarios normales solo ven SUS propios tickets
        whereCondition = {
          user_id: user.id
        };
        console.log(`🔐 Filtro aplicado: usuario solo ve sus tickets (${user.id})`);
      } else if (user.role === 'technician') {
        // Técnicos ven todos los tickets excepto los resueltos/cerrados de otros
        whereCondition = {
          OR: [
            { user_id: user.id }, // Sus propios tickets
            { 
              AND: [
                { status: { in: ['open', 'in_progress', 'pending'] } }, // Tickets activos de otros
                { NOT: { user_id: user.id } } // Excluir sus propios (ya incluidos arriba)
              ]
            }
          ]
        };
        console.log('🔧 Filtro aplicado: technician ve tickets activos');
      }
      // Admin ve todo (no aplica filtro)
  
      const tickets = await prisma.ticket.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          module: true,
          ticket_type: true,
          assigned_to_user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });
  
      console.log(`✅ Usuario ${user.email} ve ${tickets.length} tickets`);
      res.json(tickets);
      
    } catch (error) {
      console.error('❌ Error obteniendo tickets:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // backend/src/modules/tickets/tickets.controller.ts - AGREGAR DIAGNÓSTICO
export async function getTicket(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log(`🎫 GET TICKET - Solicitando ticket ${id}`);
    console.log(`👤 Usuario solicitante: ${user.email} (${user.role})`);
    console.log(`📨 Headers recibidos:`, req.headers);

    if (!user) {
      console.log('❌ No hay usuario en la request');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assigned_to_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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
              },
            },
          },
          orderBy: {
            created_at: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      console.log(`❌ Ticket ${id} no encontrado en la base de datos`);
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    console.log(`✅ Ticket encontrado: ${ticket.code}`);
    console.log(`👤 Creador del ticket: ${ticket.user.email}`);
    console.log(`🔐 Estado del ticket: ${ticket.status}`);

    // Verificación de permisos MEJORADA
    const canViewTicket = 
      user.role === 'admin' || 
      user.role === 'technician' || 
      ticket.user_id === user.id;

    console.log(`🔐 Permisos de visualización: ${canViewTicket}`);
    console.log(`🔍 Razón: ${user.role === 'admin' ? 'Es admin' : user.role === 'technician' ? 'Es technician' : ticket.user_id === user.id ? 'Es el propietario' : 'Sin permisos'}`);

    if (!canViewTicket) {
      console.log(`🚫 Usuario ${user.email} no tiene permisos para ver ticket ${id}`);
      return res.status(403).json({ error: 'No tienes permisos para ver este ticket' });
    }

    console.log(`✅ Enviando ticket ${id} a usuario ${user.email}`);
    res.json(ticket);

  } catch (error) {
    console.error('❌ Error crítico en getTicket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
  export async function debugTicket(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
  
      console.log('🐛 DEBUG TICKET - Iniciando...');
      console.log('🔍 Ticket ID:', id);
      console.log('👤 Usuario:', user);
      
      // Verificar si el ticket existe
      const ticketExists = await prisma.ticket.findUnique({
        where: { id },
        select: { id: true, code: true, user_id: true }
      });
  
      console.log('📊 Ticket en BD:', ticketExists);
      
      if (!ticketExists) {
        return res.json({ 
          error: 'Ticket no existe en BD',
          ticketId: id,
          user: user.email 
        });
      }
  
      // Verificar permisos
      const canView = user.role === 'admin' || user.role === 'technician' || ticketExists.user_id === user.id;
      
      res.json({
        ticketExists: true,
        userCanView: canView,
        userRole: user.role,
        ticketOwner: ticketExists.user_id,
        currentUser: user.id,
        isOwner: ticketExists.user_id === user.id
      });
  
    } catch (error) {
      console.error('❌ Error en debug:', error);
      res.status(500).json({ error: 'Error en debug' });
    }
}
// backend/src/modules/tickets/tickets.controller.ts - CON MÁS DEBUG
export async function createTicket(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const { module_id, ticket_type_id, subject, description, priority } = req.body;

    console.log('🔍 DEBUG CREATE TICKET - Iniciando...');
    console.log('👤 Usuario:', user);
    console.log('📦 Datos recibidos:', req.body);

    // Validaciones detalladas
    if (!module_id) {
      console.log('❌ Falta module_id');
      return res.status(400).json({ error: 'module_id es requerido' });
    }
    if (!ticket_type_id) {
      console.log('❌ Falta ticket_type_id');
      return res.status(400).json({ error: 'ticket_type_id es requerido' });
    }
    if (!description) {
      console.log('❌ Falta description');
      return res.status(400).json({ error: 'description es requerida' });
    }

    // Verificar que el módulo existe
    const moduleExists = await prisma.module.findUnique({
      where: { id: parseInt(module_id) }
    });
    if (!moduleExists) {
      console.log('❌ Módulo no existe:', module_id);
      return res.status(400).json({ error: 'El módulo seleccionado no existe' });
    }

    // Verificar que el tipo de ticket existe
    const ticketTypeExists = await prisma.ticketType.findUnique({
      where: { id: parseInt(ticket_type_id) }
    });
    if (!ticketTypeExists) {
      console.log('❌ Tipo de ticket no existe:', ticket_type_id);
      return res.status(400).json({ error: 'El tipo de ticket seleccionado no existe' });
    }

    console.log('✅ Validaciones pasadas');

    // ✅ GENERAR CÓDIGO ÚNICO MEJORADO
    const generateUniqueCode = async (): Promise<string> => {
      let code: string;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        code = `TKT-${timestamp}-${random}`;
        
        const existingTicket = await prisma.ticket.findUnique({
          where: { code }
        });
        
        if (!existingTicket) {
          return code;
        }
        
        attempts++;
        console.warn(`⚠️ Código ${code} ya existe, intentando nuevo código...`);
      } while (attempts < maxAttempts);

      throw new Error('No se pudo generar un código único después de varios intentos');
    };

    const code = await generateUniqueCode();
    console.log('📝 Creando ticket con código único:', code);

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        code,
        user_id: user.id,
        module_id: parseInt(module_id),
        ticket_type_id: parseInt(ticket_type_id),
        subject: subject || 'Sin asunto',
        description,
        priority: priority ? parseInt(priority) : 2,
        status: 'open',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        module: true,
        ticket_type: true,
      },
    });

    console.log('✅ Ticket creado exitosamente:', ticket);
    res.status(201).json(ticket);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO creando ticket:', error);
    console.error('🔴 Stack trace:', error.stack);
    console.error('🔴 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    res.status(500).json({ 
      error: 'Error interno del servidor al crear ticket',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

  export async function updateTicket(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      console.log('📝 Actualizando ticket:', id, updates);
  
      const ticket = await prisma.ticket.update({
        where: { id },
        data: updates,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          module: true,
          ticket_type: true,
          messages: {
            include: {
              sender: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              created_at: 'asc',
            },
          },
        },
      });
  
      res.json(ticket);
    } catch (error) {
      console.error('Error actualizando ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

export async function deleteTicket(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.ticket.delete({
      where: { id },
    });

    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando ticket:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function getTicketMessages(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const messages = await prisma.ticketMessage.findMany({
      where: { ticket_id: id },
      include: {
        // ✅ CORREGIDO: usar 'sender' en lugar de 'user'
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function addMessageToTicket(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { body } = req.body; // ✅ CORREGIDO: usar 'body' en lugar de 'content'
    const user = (req as any).user;

    console.log('💬 Agregando mensaje al ticket:', id);
    console.log('👤 Usuario:', user.email);
    console.log('📝 Contenido:', body);

    const message = await prisma.ticketMessage.create({
      data: {
        ticket_id: id,
        sender_id: user.id, // ✅ CORREGIDO: usar 'sender_id' en lugar de 'user_id'
        body, // ✅ CORREGIDO: usar 'body' en lugar de 'content'
        is_internal: false,
      },
      include: {
        // ✅ CORREGIDO: usar 'sender' en lugar de 'user'
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Mensaje creado exitosamente');
    res.status(201).json(message);

  } catch (error) {
    console.error('❌ Error agregando mensaje:', error);
    console.error('🔴 Detalles del error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }

  
}