import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { getDb } from '../db/mongo.js';

const router = Router();

function requireBackupAuth(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY) return next();
  if (!getAuth(req)?.userId) return res.status(401).json({ error: 'No autorizado' });
  next();
}

router.use(requireBackupAuth);

router.get('/status', async (_req, res, next) => {
  try {
    const db = await getDb();
    const latest = await db.collection('backup_runs').findOne({}, { sort: { createdAt: -1 } });
    res.json(latest || { status: 'unknown', message: 'Aún no hay ejecuciones registradas.' });
  } catch (error) { next(error); }
});

router.get('/history', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const db = await getDb();
    const items = await db.collection('backup_runs').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    res.json(items);
  } catch (error) { next(error); }
});

export default router;
