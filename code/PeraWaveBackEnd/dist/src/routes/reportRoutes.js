"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// User routes
router.post('/', authMiddleware_1.verifyToken, reportController_1.submitReport); // POST /api/reports
// Mod routes
router.get('/', authMiddleware_1.requireModerator, reportController_1.getReports); // GET  /api/reports
router.get('/stats', authMiddleware_1.requireModerator, reportController_1.getReportStats); // GET  /api/reports/stats
router.patch('/:id/status', authMiddleware_1.requireModerator, reportController_1.updateReportStatus); // PATCH /api/reports/:id/status
router.delete('/:id', authMiddleware_1.requireModerator, reportController_1.dismissReport); // DELETE /api/reports/:id
exports.default = router;
