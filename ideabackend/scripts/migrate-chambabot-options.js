/** Aplica los cambios de opciones de ChambaBot sobre datos existentes en MongoDB. */
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const REMOVED_SLUGS = new Set([
  'emprendimientos-con-base-tecnologica',
  'capital-de-emprendimiento',
  'aulas-digitales',
  'tianguis-de-productores',
  'fideapech',
  'fipes',
]);

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db('idea');
  const pages = db.collection('cms_pages');
  const combos = db.collection('searchCombos');

  const pageResult = await pages.deleteMany({ slug: { $in: [...REMOVED_SLUGS] } });
  const projectResult = await pages.updateOne(
    { slug: 'proyectos-productivos' },
    { $set: { slug: 'vende-tu-proyecto', title: 'Vende Tu Proyecto', updated_at: new Date() } },
  );

  const landing = await combos.findOne({ _id: 'landing' });
  if (landing?.options) {
    const options = landing.options.map((user) => ({
      ...user,
      ComboBoxUserMatches: (user.ComboBoxUserMatches || []).map((match) => ({
        ...match,
        ComboBoxMatchElementUrl: (match.ComboBoxMatchElementUrl || []).filter((item) => {
          const slug = String(item.ComboBoxThirdUrl || '').replace('/pagina/', '');
          return !REMOVED_SLUGS.has(slug);
        }).map((item) => item.ComboBoxThirdUrl === '/pagina/proyectos-productivos'
          ? { ...item, ComboBoxThirdText: 'Vende Tu Proyecto', ComboBoxThirdUrl: '/pagina/vende-tu-proyecto' }
          : item),
      })),
    }));
    await combos.updateOne({ _id: 'landing' }, { $set: { options, updatedAt: new Date() } });
  }

  console.log(`Migración completada: ${pageResult.deletedCount} páginas eliminadas; proyecto renombrado: ${projectResult.modifiedCount === 1}.`);
} finally {
  await client.close();
}
