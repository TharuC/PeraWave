import { Router } from 'express';
import { submitReport, getReports, updateReportStatus, getReportStats, dismissReport } from '../controllers/reportController';
import { verifyToken, requireModerator } from '../middlewares/authMiddleware';

const router = Router();

// User routes
router.post('/', verifyToken, submitReport);                          // POST /api/reports

// Mod routes
router.get('/', requireModerator, getReports);                        // GET  /api/reports
router.get('/stats', requireModerator, getReportStats);               // GET  /api/reports/stats
router.patch('/:id/status', requireModerator, updateReportStatus);    // PATCH /api/reports/:id/status
router.delete('/:id', requireModerator, dismissReport);               // DELETE /api/reports/:id

export default router;
