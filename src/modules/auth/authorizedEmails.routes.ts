// backend/src/modules/auth/authorizedEmails.routes.ts - NUEVO ARCHIVO
import { Router } from 'express';
import { EmailAuthService } from '../../service/emailAuth.service';
import { simpleAuth } from '../../middlewares/simpleAuth';
import { requireAdmin } from '../../middlewares/roleAuth';

const router = Router();
const emailAuthService = new EmailAuthService();

// Solo administradores pueden gestionar correos autorizados
router.use(simpleAuth);
router.use(requireAdmin);

// Listar todos los correos autorizados
router.get('/', async (req, res) => {
  try {
    const emails = await emailAuthService.listAuthorizedEmails();
    res.json({ total: emails.length, emails });
  } catch (error) {
    console.error('Error listando correos autorizados:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Agregar correo autorizado
router.post('/', async (req, res) => {
  try {
    const { email, role = 'user' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const authorizedEmail = await emailAuthService.addAuthorizedEmail(email, role);
    res.json({ 
      message: 'Correo autorizado agregado exitosamente',
      authorizedEmail 
    });
  } catch (error: any) {
    console.error('Error agregando correo autorizado:', error);
    
    if (error.code === 'P2002') { // Error de unicidad de Prisma
      return res.status(409).json({ error: 'El correo ya está autorizado' });
    }
    
    res.status(400).json({ error: error.message || 'Error agregando correo' });
  }
});

// Eliminar correo autorizado
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    await emailAuthService.removeAuthorizedEmail(email);
    res.json({ 
      message: 'Correo autorizado eliminado exitosamente',
      email 
    });
  } catch (error) {
    console.error('Error eliminando correo autorizado:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Verificar si un correo está autorizado
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const isAuthorized = await emailAuthService.isEmailAuthorized(email);
    const role = await emailAuthService.getAuthorizedRole(email);
    
    res.json({ 
      email, 
      isAuthorized, 
      authorizedRole: role 
    });
  } catch (error) {
    console.error('Error verificando correo:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

export default router;