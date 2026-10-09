import crypto from 'crypto';
import { getDb } from '../db/mongo.js';

const COLLECTION = 'site_visits';
const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

function hashVisitorId(value) {
  return crypto.createHash('sha256').update(String(value || 'anonymous')).digest('hex');
}

export function isBot(userAgent = '') {
  return /bot|crawler|spider|headless|slurp|facebookexternalhit|bingpreview/i.test(String(userAgent));
}

export function normalizePath(path = '/') {
  const raw = String(path || '/').trim();
  if (!raw.startsWith('/')) return '/';
  return raw.slice(0, 500) || '/';
}

function displayTitle(path, title = '') {
  if (title && title !== 'IDEA - Municipio de Chihuahua') return title;
  if (path === '/') return 'Inicio';
  if (path === '/bolsa') return 'Bolsa de empleo';
  return String(path || '').replace('/pagina/', '').replace(/^\//, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || path;
}

export function getSource(referrer = '') {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes('google.')) return 'google';
    if (host.includes('bing.')) return 'bing';
    if (host.includes('facebook.') || host.includes('instagram.')) return 'social';
    return host.slice(0, 120);
  } catch (_) {
    return 'other';
  }
}

export async function ensureAnalyticsIndexes() {
  const db = await getDb();
  await db.collection(COLLECTION).createIndexes([
    { key: { visitedAt: -1 }, name: 'visitedAt_desc' },
    { key: { path: 1, visitedAt: -1 }, name: 'path_visitedAt' },
    { key: { visitorIdHash: 1, path: 1, visitedAt: -1 }, name: 'visitor_path_visitedAt' },
  ]);
}

export async function recordVisit({ path, title, referrer, visitorId, userAgent }) {
  if (isBot(userAgent)) return { recorded: false, reason: 'bot' };

  const db = await getDb();
  const collection = db.collection(COLLECTION);
  const normalizedPath = normalizePath(path);
  const visitorIdHash = hashVisitorId(visitorId);
  const now = new Date();
  const since = new Date(now.getTime() - DEDUPE_WINDOW_MS);

  const duplicate = await collection.findOne({
    visitorIdHash,
    path: normalizedPath,
    visitedAt: { $gte: since },
  }, { projection: { _id: 1 } });

  if (duplicate) return { recorded: false, reason: 'duplicate' };

  await collection.insertOne({
    visitedAt: now,
    path: normalizedPath,
    title: String(title || '').slice(0, 300),
    referrer: String(referrer || '').slice(0, 500),
    source: getSource(referrer),
    visitorIdHash,
    userAgent: String(userAgent || '').slice(0, 300),
  });

  return { recorded: true };
}

function dateRange(from, to) {
  const end = to ? new Date(`${to}T23:59:59.999Z`) : new Date();
  const start = from ? new Date(`${from}T00:00:00.000Z`) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error('Rango de fechas inválido');
  return { start, end };
}

export async function getAnalyticsSummary({ from, to, path } = {}) {
  const db = await getDb();
  const { start, end } = dateRange(from, to);
  const match = { visitedAt: { $gte: start, $lte: end } };
  if (path) match.path = normalizePath(path);
  const [total, unique] = await Promise.all([
    db.collection(COLLECTION).countDocuments(match),
    db.collection(COLLECTION).distinct('visitorIdHash', match),
  ]);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const today = await db.collection(COLLECTION).countDocuments({ ...match, visitedAt: { $gte: todayStart, $lte: end } });
  return { total, today, uniqueVisitors: unique.length, from: start.toISOString(), to: end.toISOString() };
}

export async function getPopularPages({ from, to, path } = {}) {
  const db = await getDb();
  const { start, end } = dateRange(from, to);
  const match = { visitedAt: { $gte: start, $lte: end } };
  if (path) match.path = normalizePath(path);
  const pages = await db.collection(COLLECTION).aggregate([
    { $match: match },
    { $sort: { visitedAt: -1 } },
    { $group: { _id: '$path', title: { $first: '$title' }, visits: { $sum: 1 } } },
    { $sort: { visits: -1 } },
    { $limit: 50 },
    { $project: { _id: 0, path: '$_id', title: 1, visits: 1 } },
  ]).toArray();
  return pages.map((item) => ({ ...item, title: displayTitle(item.path, item.title) }));
}

export async function getTimeSeries({ from, to, path } = {}) {
  const db = await getDb();
  const { start, end } = dateRange(from, to);
  const match = { visitedAt: { $gte: start, $lte: end } };
  if (path) match.path = normalizePath(path);
  return db.collection(COLLECTION).aggregate([
    { $match: match },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitedAt' } }, visits: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', visits: 1 } },
  ]).toArray();
}

export async function getVisitHistory({ from, to, path, page = 1, limit = 25 } = {}) {
  const db = await getDb();
  const { start, end } = dateRange(from, to);
  const match = { visitedAt: { $gte: start, $lte: end } };
  if (path) match.path = normalizePath(path);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const [items, total] = await Promise.all([
    db.collection(COLLECTION).find(match, { projection: { visitorIdHash: 0, userAgent: 0 } }).sort({ visitedAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).toArray(),
    db.collection(COLLECTION).countDocuments(match),
  ]);
  return { items: items.map((item) => ({ ...item, title: displayTitle(item.path, item.title) })), total, page: safePage, limit: safeLimit };
}
