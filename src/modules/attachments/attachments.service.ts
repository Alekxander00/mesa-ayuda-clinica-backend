// backend/src/modules/attachments/attachments.service.ts
import { prisma } from '../../lib/prisma';
import path from 'path';
import process from 'process';

const currentDir = __dirname;
export class AttachmentsService {
  async createAttachment(attachmentData: {
    filename: string;
    mime_type: string;
    size_bytes: bigint;
    storage_path: string;
    uploaded_by: string;
    ticket_id?: string;
    message_id?: string;
  }) {
    return await prisma.attachment.create({
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

  async getAttachmentsByTicket(ticketId: string) {
    return await prisma.attachment.findMany({
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

  async getAttachmentById(id: string) {
    const attachment = await prisma.attachment.findUnique({
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

  async deleteAttachment(id: string) {
    await prisma.attachment.delete({
      where: { id }
    });
  }
}