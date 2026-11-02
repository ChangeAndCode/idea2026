import 'dotenv/config';
import { MongoClient } from 'mongodb';

const APPLY = process.argv.includes('--apply');
const uri = (process.env.MONGODB_URI || '').trim();
const dbName = process.env.MONGODB_DATABASE || 'idea';

function key(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function categoryKey(value) {
  return key(value)
    .replace(/\by\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

if (!uri) throw new Error('MONGODB_URI no configurada');

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
await client.connect();

try {
  const db = client.db(dbName);
  const site = await db.collection('cms_site_config').findOne({ _id: 'main' });
  const combos = await db.collection('searchCombos').findOne({ _id: 'landing' });
  const navItems = Array.isArray(site?.navItems) ? site.navItems : [];
  const firstFilter = Array.isArray(combos?.options) ? combos.options[0] : null;
  const matches = Array.isArray(firstFilter?.ComboBoxUserMatches)
    ? firstFilter.ComboBoxUserMatches
    : [];

  const matchByName = new Map(matches.map((match) => [categoryKey(match.ComboBoxMatchElementText), match]));
  const nextNavItems = navItems.map((item) => {
    const match = matchByName.get(categoryKey(item.label));
    const children = Array.isArray(match?.ComboBoxMatchElementUrl)
      ? match.ComboBoxMatchElementUrl
          .filter((child) => child?.ComboBoxThirdText && child?.ComboBoxThirdUrl)
          .map((child) => ({
            label: String(child.ComboBoxThirdText).trim(),
            path: String(child.ComboBoxThirdUrl).trim(),
          }))
      : Array.isArray(item.children) ? item.children : [];

    return {
      ...item,
      children,
    };
  });

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'dry-run',
    navItems: nextNavItems.map((item) => ({
      label: item.label,
      path: item.path,
      children: item.children,
    })),
  }, null, 2));

  if (APPLY) {
    await db.collection('cms_site_config').updateOne(
      { _id: 'main' },
      { $set: { navItems: nextNavItems, updated_at: new Date() } },
      { upsert: true },
    );
    console.log('Migración aplicada en cms_site_config.main');
  } else {
    console.log('Simulación únicamente. Usa --apply después de revisar el resultado.');
  }
} finally {
  await client.close();
}
