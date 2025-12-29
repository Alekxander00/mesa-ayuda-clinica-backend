// backend/src/modules/authorized-emails/authorizedEmails.routes.ts
import { Router } from 'express';
import { AuthorizedEmailsController } from './authorizedEmails.controller';
import { simpleAuth } from '../../middlewares/simpleAuth';
import { requireAdmin } from '../../middlewares/roleAuth';

const router = Router();
const controller = new AuthorizedEmailsController();

// Todas las rutas requieren autenticación y rol de administrador
router.use(simpleAuth);
router.use(requireAdmin);

// Rutas CRUD
router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.delete('/:id', controller.delete.bind(controller));
router.get('/check/:email', controller.checkEmail.bind(controller));
router.post('/import', controller.importBatch.bind(controller));

export default router;