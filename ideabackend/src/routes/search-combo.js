import { Router } from 'express';
import { getDb } from '../db/mongo.js';
import { config } from '../config.js';

const router = Router();

/**
 * GET /api/search-combo
 * Devuelve las opciones de los dropdowns (¿Quién eres?, ¿Qué buscas?, Respuestas disponibles)
 * desde MongoDB. Formato compatible con el front (ComboBoxUserName, ComboBoxUserMatches, etc.).
 */
router.get('/', async (req, res) => {
  try {
    const uri = (config.mongodb?.uri ?? '').trim();
    if (!uri) {
      return res.status(503).json({
        error: 'MongoDB no configurada. Añade MONGODB_URI al .env y ejecuta: npm run seed:search-combo',
      });
    }
    const db = await getDb();
    const doc = await db.collection('searchCombos').findOne({ _id: 'landing' });
    if (!doc) {
      return res.status(404).json({
        error: 'Opciones no cargadas. En ideabackend ejecuta: npm run seed:search-combo',
      });
    }
    res.json({
      labels: doc.labels ?? {
        combo1: '¿Quién eres?',
        combo2: '¿Qué buscas?',
        combo3: 'Respuestas disponibles',
      },
      defaultText: doc.defaultText ?? 'Seleccione una opción',
      options: doc.options ?? [],
    });
  } catch (err) {
    console.error('GET /api/search-combo', err.message);
    res.status(500).json({
      error: 'Error al conectar con la base de datos. Comprueba MONGODB_URI y ejecuta npm run seed:search-combo',
    });
  }
});

export default router;
