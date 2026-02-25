import { Router } from 'express';
import { getDb } from '../db/mongo.js';

const router = Router();

const SITE_CONFIG_ID = 'main';

/** Valores por defecto: coinciden con el Layout actual del front. Si no hay doc en DB, se devuelve esto. */
const DEFAULT_SITE_CONFIG = {
  navItems: [
    { label: 'EMPRENDIMIENTO', path: '/pagina/emprendimiento' },
    { label: 'CAPACITACIÓN', path: '/pagina/capacitacion' },
    { label: 'FERIAS/EVENTOS', path: '/pagina/ferias-y-eventos' },
    { label: 'SECTOR INDUSTRIAL', path: '/pagina/sector-industrial' },
    { label: 'APOYOS/FINANCIAMIENTOS', path: '/pagina/apoyos-y-financiamientos' },
  ],
  logoMunicipio: '/assets/logos/logo-municipio.png',
  logoIdea: '/assets/logos/logo-idea.png',
  logoChihuahua: '/assets/logos/chihuahua-capital.png',
};

/** GET configuración del sitio (navegación + logos). Si no existe, devuelve DEFAULT_SITE_CONFIG. */
router.get('/site', async (req, res, next) => {
  try {
    const db = await getDb();
    const doc = await db.collection('cms_site_config').findOne({ _id: SITE_CONFIG_ID });
    const payload = doc
      ? {
          navItems: Array.isArray(doc.navItems) ? doc.navItems : DEFAULT_SITE_CONFIG.navItems,
          logoMunicipio: doc.logoMunicipio ?? DEFAULT_SITE_CONFIG.logoMunicipio,
          logoIdea: doc.logoIdea ?? DEFAULT_SITE_CONFIG.logoIdea,
          logoChihuahua: doc.logoChihuahua ?? DEFAULT_SITE_CONFIG.logoChihuahua,
        }
      : { ...DEFAULT_SITE_CONFIG };
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

/** PUT actualiza la configuración del sitio. Acepta navItems (array) y opcionalmente logoMunicipio, logoIdea, logoChihuahua. */
router.put('/site', async (req, res, next) => {
  try {
    const body = req.body || {};
    const navItems = Array.isArray(body.navItems) ? body.navItems : undefined;
    const update = { updated_at: new Date() };
    if (navItems) {
      update.navItems = navItems.map((item) => ({
        label: String(item?.label ?? '').trim() || 'Sin título',
        path: String(item?.path ?? '').trim() || '#',
      }));
    }
    if (body.logoMunicipio !== undefined) update.logoMunicipio = String(body.logoMunicipio).trim();
    if (body.logoIdea !== undefined) update.logoIdea = String(body.logoIdea).trim();
    if (body.logoChihuahua !== undefined) update.logoChihuahua = String(body.logoChihuahua).trim();

    const db = await getDb();
    const col = db.collection('cms_site_config');
    const r = await col.findOneAndUpdate(
      { _id: SITE_CONFIG_ID },
      { $set: update },
      { upsert: true, returnDocument: 'after' }
    );
    const doc = r ?? (await col.findOne({ _id: SITE_CONFIG_ID }));
    const payload = {
      navItems: Array.isArray(doc?.navItems) ? doc.navItems : DEFAULT_SITE_CONFIG.navItems,
      logoMunicipio: doc?.logoMunicipio ?? DEFAULT_SITE_CONFIG.logoMunicipio,
      logoIdea: doc?.logoIdea ?? DEFAULT_SITE_CONFIG.logoIdea,
      logoChihuahua: doc?.logoChihuahua ?? DEFAULT_SITE_CONFIG.logoChihuahua,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

/** Lista páginas del CMS (desde MongoDB) */
router.get('/pages', async (req, res, next) => {
  try {
    const db = await getDb();
    const rows = await db.collection('cms_pages').find({}).sort({ title: 1 }).project({ slug: 1, title: 1, created_at: 1, updated_at: 1 }).toArray();
    res.json(rows.map(({ _id, ...r }) => ({ id: _id?.toString(), ...r })));
  } catch (err) {
    next(err);
  }
});

/** Obtiene una página por slug */
router.get('/pages/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const db = await getDb();
    const page = await db.collection('cms_pages').findOne({ slug });
    if (!page) return res.status(404).json({ error: 'Página no encontrada' });
    const { _id, ...rest } = page;
    res.json({ id: _id?.toString(), ...rest });
  } catch (err) {
    next(err);
  }
});

/** Crea una página */
router.post('/pages', async (req, res, next) => {
  try {
    const { slug, title, body } = req.body || {};
    if (!slug || !title) return res.status(400).json({ error: 'Faltan slug o title' });
    const db = await getDb();
    const col = db.collection('cms_pages');
    const existing = await col.findOne({ slug });
    if (existing) return res.status(409).json({ error: 'Ya existe una página con ese slug' });
    const now = new Date();
    const doc = { slug, title, body: body ?? '', created_at: now, updated_at: now };
    await col.insertOne(doc);
    const { _id, ...rest } = doc;
    res.status(201).json({ id: _id?.toString(), ...rest });
  } catch (err) {
    next(err);
  }
});

/** Actualiza una página por slug */
router.put('/pages/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, body } = req.body || {};
    const db = await getDb();
    const col = db.collection('cms_pages');
    const update = { updated_at: new Date() };
    if (title !== undefined) update.title = title;
    if (body !== undefined) update.body = body;
    const r = await col.findOneAndUpdate(
      { slug },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!r) return res.status(404).json({ error: 'Página no encontrada' });
    const { _id, ...rest } = r;
    res.json({ id: _id?.toString(), ...rest });
  } catch (err) {
    next(err);
  }
});

/** Elimina una página por slug */
router.delete('/pages/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const db = await getDb();
    const r = await db.collection('cms_pages').deleteOne({ slug });
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Página no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
