import { Router } from 'express';
import { searchJobs } from '../services/jsearch.js';

const router = Router();

/**
 * GET /api/jobs
 * Query: query, country, employment_type, remote, date_posted, page, limit
 */
router.get('/', async (req, res, next) => {
  try {
  const {
    query: q,
    country = 'MX',
    employment_type,
    remote,
    date_posted = 'week',
    page = 1,
    limit = 10,
  } = req.query;
  const opts = {
    query: q || undefined,
    country,
    employment_type: employment_type || undefined,
    work_from_home: remote === 'true' ? true : remote === 'false' ? false : undefined,
    date_posted,
    page: Math.max(1, Number(page)),
    num_pages: 1,
  };
  const jobs = await searchJobs(opts);
  const max = Math.min(Number(limit) || 10, 50);
  res.json(jobs.slice(0, max));
  } catch (err) {
    next(err);
  }
});

export default router;
