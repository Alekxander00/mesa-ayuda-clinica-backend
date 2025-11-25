// backend/src/modules/attachments/attachments.controller.ts - COMPLETO
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import path from 'path';
import fs from 'fs';

export const getTicketAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log(`📎 Obteniendo adjuntos del ticket: ${id}`);
    console.log(`👤 Usuario: ${user.email} (${user.role})`);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { 
        id: true,
        user_id: true,
        assigned_to: true 
      }
    });

    if (!ticket) {
      console.log(`❌ Ticket ${id} no encontrado`);
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const canView = user.role === 'admin' || 
                   user.role === 'technician' || 
                   ticket.user_id === user.id;

    if (!canView) {
      console.log(`🚫 Usuario ${user.email} no tiene permisos para ver adjuntos del ticket ${id}`);
      return res.status(403).json({ error: 'No tienes permisos para ver los adjuntos de este ticket' });
    }

    const attachments = await prisma.attachment.findMany({
      where: { ticket_id: id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`✅ Encontrados ${attachments.length} adjuntos para ticket ${id}`);

    const attachmentsWithStringSize = attachments.map(att => ({
      ...att,
      size_bytes: att.size_bytes.toString()
    }));

    res.json(attachmentsWithStringSize);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO obteniendo adjuntos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const uploadAttachments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const files = req.files as Express.Multer.File[];

    console.log(`📎 Subiendo adjuntos al ticket: ${id}`);
    console.log(`👤 Usuario: ${user.email}`);
    console.log(`📁 Archivos recibidos: ${files?.length || 0}`);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se recibieron archivos' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!ticket) {
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const attachments = await Promise.all(
      files.map(async (file) => {
        console.log(`📁 Guardando archivo: ${file.originalname}`);
        console.log(`📊 Tamaño: ${file.size} bytes`);
        console.log(`🎯 Tipo MIME: ${file.mimetype}`);
        console.log(`💾 Ruta: ${file.path}`);

        const attachment = await prisma.attachment.create({
          data: {
            filename: file.originalname,
            mime_type: file.mimetype,
            size_bytes: BigInt(file.size),
            storage_path: file.path,
            uploaded_by: user.id,
            ticket_id: id,
          },
          include: {
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        });
    
        return {
          ...attachment,
          size_bytes: attachment.size_bytes.toString()
        };
      })
    );

    console.log(`✅ ${attachments.length} archivos guardados en la base de datos`);

    res.status(201).json({
      message: 'Archivos subidos exitosamente',
      attachments: attachments,
      total: attachments.length
    });

  } catch (error) {
    console.error('❌ Error subiendo archivos:', error);
    
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Error interno del servidor al subir archivos' });
  }
};

export const downloadAttachment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log(`📥 Solicitando descarga de adjunto: ${id}`);

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            user_id: true,
            assigned_to: true
          }
        }
      }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const canDownload = user.role === 'admin' || 
                       user.role === 'technician' || 
                       attachment.ticket.user_id === user.id;

    if (!canDownload) {
      return res.status(403).json({ error: 'No tienes permisos para acceder a este archivo' });
    }

    // ✅ CORREGIR: NORMALIZAR LA RUTA
    const normalizedPath = attachment.storage_path.replace(/\\/g, '/');
    const absolutePath = path.resolve(normalizedPath);
    
    console.log(`📁 Ruta para descarga: ${absolutePath}`);

    if (!fs.existsSync(absolutePath)) {
      console.log(`❌ Archivo físico no existe: ${absolutePath}`);
      
      // Intentar con ruta relativa
      const uploadsPath = path.join('uploads', path.basename(normalizedPath));
      if (fs.existsSync(uploadsPath)) {
        console.log(`✅ Archivo encontrado en ubicación alternativa: ${uploadsPath}`);
        res.setHeader('Content-Type', attachment.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
        return res.sendFile(path.resolve(uploadsPath));
      }
      
      return res.status(404).json({ error: 'El archivo no existe en el servidor' });
    }

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    
    res.sendFile(absolutePath);

  } catch (error) {
    console.error('❌ Error descargando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getImageWithAuth = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log(`🔐 IMAGEN CON AUTH: ${id} para ${user.email}`);

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            user_id: true,
            assigned_to: true
          }
        }
      }
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    if (!attachment.mime_type.startsWith('image/')) {
      return res.status(400).json({ error: 'El archivo no es una imagen' });
    }

    const canView = user.role === 'admin' || 
                   user.role === 'technician' || 
                   attachment.ticket.user_id === user.id;

    if (!canView) {
      return res.status(403).json({ error: 'No tienes permisos' });
    }

    // Normalizar ruta
    const normalizedPath = attachment.storage_path.replace(/\\/g, '/');
    const absolutePath = path.resolve(normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      const uploadsPath = path.join('uploads', path.basename(normalizedPath));
      if (fs.existsSync(uploadsPath)) {
        res.setHeader('Content-Type', attachment.mime_type);
        res.setHeader('Content-Disposition', 'inline');
        return res.sendFile(path.resolve(uploadsPath));
      }
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(absolutePath);

  } catch (error) {
    console.error('❌ Error en getImageWithAuth:', error);
    res.status(500).json({ error: 'Error interno' });
  }
};

// ✅ ENDPOINT NUEVO PARA VISUALIZACIÓN DE IMÁGENES
export const viewImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    console.log(`🖼️ SOLICITANDO VISUALIZACIÓN DE IMAGEN: ${id}`);
    console.log(`👤 Usuario: ${user.email}`);

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            user_id: true,
            assigned_to: true
          }
        }
      }
    });

    if (!attachment) {
      console.log(`❌ Archivo ${id} no encontrado`);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    if (!attachment.mime_type.startsWith('image/')) {
      console.log(`❌ El archivo ${id} no es una imagen: ${attachment.mime_type}`);
      return res.status(400).json({ error: 'El archivo no es una imagen' });
    }

    const canView = user.role === 'admin' || 
                   user.role === 'technician' || 
                   attachment.ticket.user_id === user.id;

    if (!canView) {
      console.log(`🚫 Usuario ${user.email} no tiene permisos para ver imagen ${id}`);
      return res.status(403).json({ error: 'No tienes permisos para ver esta imagen' });
    }

    // ✅ CORREGIR: NORMALIZAR LA RUTA PARA LINUX
    const normalizedPath = attachment.storage_path.replace(/\\/g, '/');
    const absolutePath = path.resolve(normalizedPath);
    
    console.log(`📁 Ruta original: ${attachment.storage_path}`);
    console.log(`📁 Ruta normalizada: ${normalizedPath}`);
    console.log(`📁 Ruta absoluta: ${absolutePath}`);

    if (!fs.existsSync(absolutePath)) {
      console.log(`❌ Archivo físico no existe: ${absolutePath}`);
      
      // Intentar con ruta relativa a uploads/
      const uploadsPath = path.join('uploads', path.basename(normalizedPath));
      console.log(`🔄 Intentando con ruta alternativa: ${uploadsPath}`);
      
      if (fs.existsSync(uploadsPath)) {
        console.log(`✅ Archivo encontrado en ubicación alternativa: ${uploadsPath}`);
        res.setHeader('Content-Type', attachment.mime_type);
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(path.resolve(uploadsPath));
      }
      
      return res.status(404).json({ error: 'La imagen no existe en el servidor' });
    }

    console.log(`✅ Enviando imagen: ${attachment.filename}`);
    console.log(`📁 Ruta: ${absolutePath}`);
    console.log(`📦 Tipo MIME: ${attachment.mime_type}`);

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    res.sendFile(absolutePath);

  } catch (error) {
    console.error('❌ ERROR CRÍTICO visualizando imagen:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al visualizar imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};