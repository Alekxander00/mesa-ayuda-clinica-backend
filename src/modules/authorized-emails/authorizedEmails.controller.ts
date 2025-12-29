// backend/src/modules/authorized-emails/authorizedEmails.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class AuthorizedEmailsController {
  // Obtener todos los correos autorizados
  async getAll(req: Request, res: Response) {
    try {
      const emails = await prisma.authorizedEmail.findMany({
        orderBy: { created_at: 'desc' }
      });
      
      res.json({
        success: true,
        data: emails,
        count: emails.length
      });
    } catch (error) {
      console.error('Error obteniendo correos autorizados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Agregar nuevo correo autorizado
  async create(req: Request, res: Response) {
    try {
      const { email, role = 'user' } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'El correo electrónico es requerido' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Formato de correo electrónico inválido' 
        });
      }

      // Validar rol
      const validRoles = ['user', 'technician', 'admin', 'auditor'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          success: false, 
          error: `Rol inválido. Roles permitidos: ${validRoles.join(', ')}` 
        });
      }

      // Verificar si ya existe
      const existing = await prisma.authorizedEmail.findUnique({
        where: { email }
      });

      if (existing) {
        return res.status(409).json({ 
          success: false, 
          error: 'Este correo ya está en la lista de autorizados' 
        });
      }

      // Crear registro
      const authorizedEmail = await prisma.authorizedEmail.create({
        data: {
          email,
          allowed_role: role as any
        }
      });

      res.status(201).json({
        success: true,
        message: 'Correo autorizado agregado exitosamente',
        data: authorizedEmail
      });

    } catch (error: any) {
      console.error('Error agregando correo autorizado:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({ 
          success: false, 
          error: 'Este correo ya está en la lista de autorizados' 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  // Eliminar correo autorizado
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID del correo es requerido' 
        });
      }

      const emailRecord = await prisma.authorizedEmail.findUnique({
        where: { id }
      });

      if (!emailRecord) {
        return res.status(404).json({ 
          success: false, 
          error: 'Correo autorizado no encontrado' 
        });
      }

      await prisma.authorizedEmail.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: `Correo ${emailRecord.email} eliminado de la lista autorizada`
      });

    } catch (error) {
      console.error('Error eliminando correo autorizado:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  // Verificar si un correo está autorizado (para API)
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          error: 'Correo electrónico es requerido' 
        });
      }

      const authorizedEmail = await prisma.authorizedEmail.findUnique({
        where: { email }
      });

      res.json({
        success: true,
        data: {
          email,
          isAuthorized: !!authorizedEmail,
          role: authorizedEmail?.allowed_role || null,
          details: authorizedEmail
        }
      });

    } catch (error) {
      console.error('Error verificando correo:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  // Importar múltiples correos
  async importBatch(req: Request, res: Response) {
    try {
      const { emails } = req.body; // Array de objetos [{email, role}, ...]
      
      if (!Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Se requiere un array de correos' 
        });
      }

      const results = {
        success: [],
        failed: [],
        skipped: []
      };

      for (const item of emails) {
        const { email, role = 'user' } = item;

        try {
          // Validar email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            results.failed.push({ email, error: 'Formato inválido' });
            continue;
          }

          // Verificar si ya existe
          const existing = await prisma.authorizedEmail.findUnique({
            where: { email }
          });

          if (existing) {
            results.skipped.push({ email, reason: 'Ya existe' });
            continue;
          }

          // Crear registro
          const authorizedEmail = await prisma.authorizedEmail.create({
            data: {
              email,
              allowed_role: role as any
            }
          });

          results.success.push(authorizedEmail);
        } catch (error) {
          results.failed.push({ email, error: error.message });
        }
      }

      res.json({
        success: true,
        message: 'Importación completada',
        summary: {
          total: emails.length,
          success: results.success.length,
          failed: results.failed.length,
          skipped: results.skipped.length
        },
        details: results
      });

    } catch (error) {
      console.error('Error en importación masiva:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }
}