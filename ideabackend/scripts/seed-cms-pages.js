/**
 * Seed cms_pages en MongoDB con las páginas hijas de Umbraco (DDEyC).
 * Así /pagina/:slug tiene documento y la navegación desde los dropdowns funciona.
 * Uso: node scripts/seed-cms-pages.js
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';

function slug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Páginas derivadas de Umbraco uSync Content (Path + NodeName). Slug = mismo que seed-search-combo (slug del nombre).
const PAGES = [
  { name: 'DDEyC', path: '/Home/DDEyC' },
  { name: 'Emprendimiento', path: '/Home/DDEyC/Emprendimiento' },
  { name: 'Capacitación', path: '/Home/DDEyC/Capacitacion' },
  { name: 'Ferias y Eventos', path: '/Home/DDEyC/FeriasYEventos' },
  { name: 'Sector Industrial', path: '/Home/DDEyC/SectorIndustrial' },
  { name: 'Apoyos y Financiamientos', path: '/Home/DDEyC/ApoyosYFinanciamientos' },
  { name: 'Incubadoras', path: '/Home/DDEyC/Emprendimiento/Incubadoras' },
  { name: 'INCUBECH', path: '/Home/DDEyC/Emprendimiento/Incubadoras/INCUBECH' },
  { name: 'Becas con universidades', path: '/Home/DDEyC/Emprendimiento/Incubadoras/BecasConUniversidades' },
  { name: 'Branding', path: '/Home/DDEyC/Emprendimiento/Branding' },
  { name: 'Propiedad Intelectual', path: '/Home/DDEyC/Emprendimiento/PropiedadIntelectual' },
  { name: 'Permisos y licencias', path: '/Home/DDEyC/Emprendimiento/PermisosYLicencias' },
  { name: 'Mi situación fiscal', path: '/Home/DDEyC/Emprendimiento/MiSituacionFiscal' },
  { name: 'SAT en el SARE', path: '/Home/DDEyC/Emprendimiento/MiSituacionFiscal/SATEnElSARE' },
  { name: 'Guía para apertura de negocios', path: '/Home/DDEyC/Emprendimiento/MiSituacionFiscal/GuiaParaAperturaDeNegocios' },
  { name: 'Emprendimientos con base tecnológica', path: '/Home/DDEyC/Emprendimiento/EmprendimientosConBaseTecnologica' },
  { name: 'MIFAM', path: '/Home/DDEyC/Capacitacion/MIFAM' },
  { name: 'ENCES', path: '/Home/DDEyC/Capacitacion/ENCES' },
  { name: 'Capital de emprendimiento', path: '/Home/DDEyC/Capacitacion/CapitalDeEmprendimiento' },
  { name: 'Aulas digitales', path: '/Home/DDEyC/Capacitacion/AulasDigitales' },
  { name: 'Tianguis de productores', path: '/Home/DDEyC/FeriasYEventos/TianguisDeProductores' },
  { name: 'Impulso a eventos y festividades', path: '/Home/DDEyC/FeriasYEventos/ImpulsoAEventosYFestividades' },
  { name: 'Proyectos productivos', path: '/Home/DDEyC/ApoyosYFinanciamientos/ProyectosProductivos' },
  { name: 'FOMECH', path: '/Home/DDEyC/ApoyosYFinanciamientos/FOMECH' },
  { name: 'Impulso municipal', path: '/Home/DDEyC/ApoyosYFinanciamientos/ImpulsoMunicipal' },
  { name: 'Otros programas de la red', path: '/Home/DDEyC/ApoyosYFinanciamientos/OtrosProgramasDeLaRed' },
  { name: 'FIDEAPECH', path: '/Home/DDEyC/ApoyosYFinanciamientos/OtrosProgramasDeLaRed/FIDEAPECH' },
  { name: 'FIPES', path: '/Home/DDEyC/ApoyosYFinanciamientos/OtrosProgramasDeLaRed/FIPES' },
  { name: 'Desarrollo de proveedores', path: '/Home/DDEyC/SectorIndustrial/DesarrolloDeProveedores' },
  { name: 'Clúster', path: '/Home/DDEyC/SectorIndustrial/Cluster' },
  { name: 'Atracción de inversión', path: '/Home/DDEyC/SectorIndustrial/AtraccionDeInversion' },
  { name: 'UBICACIÓN DDEYC', path: '/Home/DDEyC/Ubicacion' },
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('idea');
    const col = db.collection('cms_pages');

    let inserted = 0;
    for (const p of PAGES) {
      const s = slug(p.name);
      const doc = {
        slug: s,
        title: p.name,
        body: `<p>Contenido de <strong>${p.name}</strong>. (Página cargada desde estructura Umbraco; puedes editar el contenido desde el CMS o la base de datos.)</p>`,
        updatedAt: new Date(),
      };
      const r = await col.updateOne(
        { slug: s },
        { $set: doc },
        { upsert: true }
      );
      if (r.upsertedCount || r.modifiedCount) inserted++;
    }
    console.log(`cms_pages: ${PAGES.length} páginas listadas, ${inserted} actualizadas/insertadas.`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
