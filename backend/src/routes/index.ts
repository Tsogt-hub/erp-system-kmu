import { Router } from 'express';
import authRoutes from './auth.routes';
import projectsRoutes from './projects.routes';
import crmRoutes from './crm.routes';
import timeTrackingRoutes from './timeTracking.routes';
import ticketsRoutes from './tickets.routes';
import inventoryRoutes from './inventory.routes';
import offersRoutes from './offers.routes';
import invoicesRoutes from './invoices.routes';
import pipelinesRoutes from './pipelines.routes';
import dashboardRoutes from './dashboard.routes';
import usersRoutes from './users.routes';
import notificationsRoutes from './notifications.routes';
import calendarEventRoutes from './calendarEvent.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/projects', projectsRoutes);
router.use('/crm', crmRoutes);
router.use('/time-tracking', timeTrackingRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/offers', offersRoutes);
router.use('/invoices', invoicesRoutes);
router.use('/pipelines', pipelinesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/calendar-events', calendarEventRoutes);

export default router;

