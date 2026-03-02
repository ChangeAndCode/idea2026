import { Router } from 'express';
import { getDb } from '../db/mongo.js';
import { config } from '../config.js';
import { defaultSearchComboOptions } from '../data/search-combo-defaults.js';

const router = Router();

const DEFAULT_LABELS = {
  combo1: '¿Quién eres?',
  combo2: '¿Qué buscas?',
  combo3: 'Respuestas disponibles',
};

/**
 * GET /api/search-combo
 * Devuelve las opciones de los dropdowns desde MongoDB.
 * Si no existe el documento, lo crea con valores por defecto (auto-poblado).
 */
router.get('/', async (req, res) => {
  try {
    const uri = (config.mongodb?.uri ?? '').trim();
    if (!uri) {
      return res.status(503).json({
        error: 'MongoDB no configurada. Añade MONGODB_URI al .env',
      });
    }
    const db = await getDb();
    let doc = await db.collection('searchCombos').findOne({ _id: 'landing' });
    if (!doc) {
      const newDoc = {
        _id: 'landing',
        labels: DEFAULT_LABELS,
        defaultText: 'Seleccione una opción',
        options: defaultSearchComboOptions,
        updatedAt: new Date(),
      };
      await db.collection('searchCombos').insertOne(newDoc);
      doc = newDoc;
    }
    res.json({
      labels: doc.labels ?? DEFAULT_LABELS,
      defaultText: doc.defaultText ?? 'Seleccione una opción',
      options: doc.options ?? [],
    });
  } catch (err) {
    console.error('GET /api/search-combo', err.message);
    res.status(500).json({
      error: 'Error al conectar con la base de datos. Comprueba MONGODB_URI',
    });
  }
});

export default router;
