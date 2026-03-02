/**
 * Seed search combo en MongoDB (opcional).
 * La API ya auto-pobla en la primera petición; este script sirve para resetear a valores por defecto.
 * Uso: node scripts/seed-search-combo.js
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { defaultSearchComboOptions } from '../src/data/search-combo-defaults.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Falta MONGODB_URI en .env');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('idea');
    const col = db.collection('searchCombos');
    const doc = {
      _id: 'landing',
      labels: {
        combo1: '¿Quién eres?',
        combo2: '¿Qué buscas?',
        combo3: 'Respuestas disponibles',
      },
      defaultText: 'Seleccione una opción',
      options: defaultSearchComboOptions,
      updatedAt: new Date(),
    };
    await col.replaceOne({ _id: 'landing' }, doc, { upsert: true });
    console.log('MongoDB: searchCombos.landing actualizado correctamente');
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
