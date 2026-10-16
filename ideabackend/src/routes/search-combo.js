import { Router } from 'express';
import { getDb } from '../db/mongo.js';
import { config } from '../config.js';

const router = Router();

const DEFAULT_LABELS = {
  combo1: '¿Quién eres?',
  combo2: '¿Qué buscas?',
  combo3: 'Respuestas disponibles',
};

function filterValidOptions(options, validSlugs) {
  return (Array.isArray(options) ? options : [])
    .map((user) => ({
      ...user,
      ComboBoxUserMatches: (Array.isArray(user.ComboBoxUserMatches) ? user.ComboBoxUserMatches : [])
        .map((match) => ({
          ...match,
          ComboBoxMatchElementUrl: (Array.isArray(match.ComboBoxMatchElementUrl) ? match.ComboBoxMatchElementUrl : [])
            .filter((answer) => answer?.ComboBoxThirdUrl === '/bolsa' || validSlugs.has(String(answer?.ComboBoxThirdUrl ?? '').replace('/pagina/', ''))),
        }))
        .filter((match) => match.ComboBoxMatchElementUrl.length > 0),
    }))
    .filter((user) => user.ComboBoxUserMatches.length > 0);
}

router.get('/', async (req, res) => {
  try {
    const uri = (config.mongodb?.uri ?? '').trim();
    if (!uri) return res.status(503).json({ error: 'MongoDB no configurada. AÃ±ade MONGODB_URI al .env' });

    const db = await getDb();
    let doc = await db.collection('searchCombos').findOne({ _id: 'landing' });
    if (!doc) {
      doc = { _id: 'landing', labels: DEFAULT_LABELS, defaultText: 'Seleccione una opciÃ³n', options: [], updatedAt: new Date() };
      await db.collection('searchCombos').insertOne(doc);
    }

    const pages = await db.collection('cms_pages').find({}).project({ slug: 1 }).toArray();
    const validSlugs = new Set(pages.map((page) => page.slug));
    res.json({ labels: doc.labels ?? DEFAULT_LABELS, defaultText: doc.defaultText ?? 'Seleccione una opciÃ³n', options: filterValidOptions(doc.options, validSlugs) });
  } catch (err) {
    console.error('GET /api/search-combo', err.message);
    res.status(500).json({ error: 'Error al conectar con la base de datos. Comprueba MONGODB_URI' });
  }
});

export default router;
