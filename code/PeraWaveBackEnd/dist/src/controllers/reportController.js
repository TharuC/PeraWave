"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissReport = exports.getReportStats = exports.updateReportStatus = exports.getReports = exports.submitReport = void 0;
const db_1 = __importDefault(require("../config/db"));
const MAX_REPORTS_PER_DAY = 10;
// POST /api/reports  – submit a report (user only)
const submitReport = async (req, res) => {
    try {
        const reporterId = req.user?.userId;
        const { contentType, contentId, reason, description } = req.body;
        if (!contentType || !contentId || !reason) {
            return res.status(400).json({ error: 'contentType, contentId, and reason are required.' });
        }
        const validTypes = ['POST', 'COMMENT'];
        if (!validTypes.includes(contentType)) {
            return res.status(400).json({ error: 'contentType must be POST or COMMENT.' });
        }
        const validReasons = ['SPAM', 'HARASSMENT', 'MISINFORMATION', 'INAPPROPRIATE', 'DUPLICATE', 'OTHER'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ error: 'Invalid reason.' });
        }
        // ── Anti-abuse: duplicate report prevention ──────────────────────────
        const existingReport = await db_1.default.report.findFirst({
            where: { reporterId, contentType, contentId: Number(contentId) },
        });
        if (existingReport) {
            return res.status(409).json({ error: 'You have already reported this content.' });
        }
        // ── Anti-abuse: daily limit ──────────────────────────────────────────
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyCount = await db_1.default.report.count({
            where: { reporterId, createdAt: { gte: today } },
        });
        if (dailyCount >= MAX_REPORTS_PER_DAY) {
            return res.status(429).json({ error: `Report limit reached (${MAX_REPORTS_PER_DAY} per day).` });
        }
        // ── Create the report ────────────────────────────────────────────────
        const report = await db_1.default.report.create({
            data: {
                reporterId,
                contentType,
                contentId: Number(contentId),
                reason,
                description: description?.trim() || null,
                status: 'PENDING',
            },
        });
        // ── Auto-flagging: if post/comment gets ≥3 reports, mark as flagged ──
        const FLAG_THRESHOLD = 3;
        const reportCount = await db_1.default.report.count({
            where: { contentType, contentId: Number(contentId), status: { not: 'REJECTED' } },
        });
        if (reportCount >= FLAG_THRESHOLD) {
            if (contentType === 'POST') {
                await db_1.default.forumPost.update({
                    where: { id: Number(contentId) },
                    data: { isFlagged: true },
                });
            }
            else if (contentType === 'COMMENT') {
                await db_1.default.comment.update({
                    where: { id: Number(contentId) },
                    data: { isFlagged: true },
                });
            }
        }
        return res.status(201).json({ message: 'Report submitted successfully.', report });
    }
    catch (err) {
        console.error('submitReport error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.submitReport = submitReport;
// GET /api/reports  – list all reports (mod only), with filters
const getReports = async (req, res) => {
    try {
        const { status, contentType, reason, page = '1', limit = '20' } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (contentType)
            where.contentType = contentType;
        if (reason)
            where.reason = reason;
        const skip = (Number(page) - 1) * Number(limit);
        const [reports, total] = await Promise.all([
            db_1.default.report.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
                include: {
                    reporter: { select: { id: true, fullName: true, email: true } },
                },
            }),
            db_1.default.report.count({ where }),
        ]);
        return res.json({ reports, total, page: Number(page), limit: Number(limit) });
    }
    catch (err) {
        console.error('getReports error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.getReports = getReports;
// PATCH /api/reports/:id/status  – update report status (mod only)
const updateReportStatus = async (req, res) => {
    try {
        const reportId = Number(req.params.id);
        const { status, modNote } = req.body;
        const validStatuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }
        const report = await db_1.default.report.update({
            where: { id: reportId },
            data: { status, modNote: modNote || null },
        });
        // Notify the reporter if their report was resolved or rejected
        if (status === 'RESOLVED' || status === 'REJECTED') {
            const message = status === 'RESOLVED'
                ? 'Your report has been reviewed and action has been taken. Thank you for helping keep PeraWave safe.'
                : 'Your report has been reviewed and was determined not to violate our community guidelines.';
            await db_1.default.notification.create({
                data: {
                    userId: report.reporterId,
                    type: 'INFO',
                    message,
                },
            });
        }
        return res.json({ message: 'Report status updated.', report });
    }
    catch (err) {
        console.error('updateReportStatus error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.updateReportStatus = updateReportStatus;
// GET /api/reports/stats  – report statistics (mod only)
const getReportStats = async (_req, res) => {
    try {
        const [pending, underReview, resolved, rejected, total, flaggedPosts, flaggedComments] = await Promise.all([
            db_1.default.report.count({ where: { status: 'PENDING' } }),
            db_1.default.report.count({ where: { status: 'UNDER_REVIEW' } }),
            db_1.default.report.count({ where: { status: 'RESOLVED' } }),
            db_1.default.report.count({ where: { status: 'REJECTED' } }),
            db_1.default.report.count(),
            db_1.default.forumPost.count({ where: { isFlagged: true } }),
            db_1.default.comment.count({ where: { isFlagged: true } }),
        ]);
        return res.json({ pending, underReview, resolved, rejected, total, flaggedPosts, flaggedComments });
    }
    catch (err) {
        console.error('getReportStats error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.getReportStats = getReportStats;
// DELETE /api/reports/:id  – dismiss a report (mod only)
const dismissReport = async (req, res) => {
    try {
        const reportId = Number(req.params.id);
        await db_1.default.report.update({ where: { id: reportId }, data: { status: 'REJECTED' } });
        return res.json({ message: 'Report dismissed.' });
    }
    catch (err) {
        console.error('dismissReport error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
exports.dismissReport = dismissReport;
