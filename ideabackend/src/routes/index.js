import { Router } from 'express';
import cms from './cms.js';
import jobs from './jobs.js';
import chat from './chat.js';
import searchCombo from './search-combo.js';
import analytics from './analytics.js';
import backups from './backups.js';

const router = Router();

router.use('/cms', cms);
router.use('/jobs', jobs);
router.use('/chat', chat);
router.use('/search-combo', searchCombo);
router.use('/analytics', analytics);
router.use('/backups', backups);

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ideabackend' });
});

export default router;
