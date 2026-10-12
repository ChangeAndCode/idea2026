import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { ensureAnalyticsIndexes, getAnalyticsSummary, getPopularPages, getTimeSeries, getVisitHistory, recordVisit } from '../services/analytics.js';

const router = Router();

function requireAnalyticsAuth(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY) return next();
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: 'No autorizado' });
  next();
}

function queryOptions(req) {
  return { from: req.query.from, to: req.query.to, path: req.query.path };
}

router.post('/visits', async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await recordVisit({
      path: body.path,
      title: body.title,
      referrer: body.referrer,
      visitorId: body.visitorId,
      userAgent: req.get('user-agent'),
    });
    res.status(result.recorded ? 201 : 200).json(result);
  } catch (err) {
    next(err);
  }
});

router.use(requireAnalyticsAuth);

router.get('/summary', async (req, res, next) => {
  try { res.json(await getAnalyticsSummary(queryOptions(req))); } catch (err) { next(err); }
});

router.get('/pages', async (req, res, next) => {
  try { res.json(await getPopularPages(queryOptions(req))); } catch (err) { next(err); }
});

router.get('/timeseries', async (req, res, next) => {
  try { res.json(await getTimeSeries(queryOptions(req))); } catch (err) { next(err); }
});

router.get('/history', async (req, res, next) => {
  try { res.json(await getVisitHistory({ ...queryOptions(req), page: req.query.page, limit: req.query.limit })); } catch (err) { next(err); }
});

ensureAnalyticsIndexes().catch((err) => console.error('Analytics indexes:', err.message));

export default router;
