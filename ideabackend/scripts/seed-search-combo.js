/**
 * Seed search combo (dropdowns de la landing) desde Umbraco home.config a MongoDB.
 * Uso: node scripts/seed-search-combo.js [ruta-home.config]
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { MongoClient } from 'mongodb';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultConfigPath = join(
  __dirname,
  '../../../Umbraco---DDEyC/DD/uSync/v9/Content/home.config'
);

function slug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function toUrl(name) {
  const n = (name || '').trim();
  if (/bolsa\s+de\s+trabajo/i.test(n)) return '/bolsa';
  return `/pagina/${slug(n)}`;
}

function transformUmbracoToApi(contentData) {
  const options = [];
  for (const userBlock of contentData || []) {
    const userName = userBlock.comboBoxUserName;
    if (!userName) continue;
    const matches = [];
    const userMatches = userBlock.comboBoxUserMatches?.contentData || [];
    for (const matchBlock of userMatches) {
      const matchText = matchBlock.comboBoxMatchElementText;
      if (!matchText) continue;
      const urls = [];
      const urlBlocks = matchBlock.comboBoxMatchElementURL?.contentData || [];
      for (const urlBlock of urlBlocks) {
        const third = urlBlock.comboBoxThirdURL;
        const list = Array.isArray(third) ? third : third ? [third] : [];
        for (const item of list) {
          const name = item.name || item.ComboBoxThirdText;
          if (name) urls.push({ ComboBoxThirdText: name, ComboBoxThirdUrl: toUrl(name) });
        }
      }
      matches.push({ ComboBoxMatchElementText: matchText, ComboBoxMatchElementUrl: urls });
    }
    options.push({ ComboBoxUserName: userName, ComboBoxUserMatches: matches });
  }
  return options;
}

function extractSearchComboFromXml(xml) {
  const match = xml.match(/<searchComboContents>\s*<Value><!\[CDATA\[([\s\S]*?)\]\]>\s*<\/Value>/);
  if (!match) throw new Error('No se encontró searchComboContents en el XML');
  const json = JSON.parse(match[1]);
  return json.contentData || [];
}

async function run() {
  const configPath = process.argv[2] || defaultConfigPath;
  console.log('Leyendo', configPath);
  const xml = readFileSync(configPath, 'utf8');
  const contentData = extractSearchComboFromXml(xml);
  const options = transformUmbracoToApi(contentData);
  console.log('Tipos de usuario:', options.length);
  console.log('Opciones transformadas (primer tipo):', options[0]?.ComboBoxUserName, '→', options[0]?.ComboBoxUserMatches?.length, 'matches');

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
      options,
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
