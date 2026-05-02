import express from 'express';
import { getUsers, warnUser, suspendUser, deleteUser } from '../controllers/modController';

const router = express.Router();

router.get('/users', getUsers);
router.post('/users/warn', warnUser);
router.post('/users/suspend', suspendUser);
router.post('/users/delete', deleteUser);

export default router;
