/**
 * Extrae texto de .docx en "Portal Digital IDEA /contenidos" y genera
 * datos estáticos para el frontend. Copia imágenes a public/contenidos.
 * Ejecutar desde raíz de ideafront: node scripts/import-contenidos.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CONTENIDOS = path.resolve(ROOT, '../../Portal Digital IDEA /contenidos ');
const PUBLIC_CONTENIDOS = path.join(ROOT, 'public', 'contenidos');
const OUT_FILE = path.join(ROOT, 'src', 'lib', 'cms-static-data.js');

// [carpeta (nombre exacto en disco), nombre archivo .docx, slug]
const DOCX_TO_SLUG = [
  ['APOYOS Y FINANCIAMIENTOS ', 'FOMECH.docx', 'fomech'],
  ['APOYOS Y FINANCIAMIENTOS ', 'IMPULSO MUNICIPAL MIPYME.docx', 'impulso-municipal'],
  ['APOYOS Y FINANCIAMIENTOS ', 'Proyectos Productivos .docx', 'proyectos-productivos'],
  ['APOYOS Y FINANCIAMIENTOS ', 'Otros Apoyos y Créditos Disponibles para Empresarios.docx', 'otros-programas-de-la-red'],
  ['CAPACITACION', 'MIFAMs.docx', 'mifam'],
  ['CAPACITACION', 'ENCES PAGINA.docx', 'ences'],
  ['CAPACITACION', 'Capital de Emprendimiento (pagina).docx', 'capital-de-emprendimiento'],
  ['CAPACITACION', 'Capital Virtual es una iniciativa del Gobierno Municipal de Chihuahua en colaboración con Digital Family y respaldada por el Gobierno del Estado de Chihuahua y la asociación c.docx', 'aulas-digitales'],
  ['EMPRENDIMIENTO', 'INCUBECH.docx', 'incubech'],
  ['EMPRENDIMIENTO', 'BECAS DE INCUBACIÓN CON UNIVERSIDAD.docx', 'becas-con-universidades'],
  ['EMPRENDIMIENTO', ' mejora tu marca.docx', 'branding'],
  ['EMPRENDIMIENTO', 'propiedad intelectual.docx', 'propiedad-intelectual'],
  ['EMPRENDIMIENTO', 'SAT en El SARE.docx', 'sat-en-el-sare'],
  ['EMPRENDIMIENTO', 'Guía Práctica Completa para la Apertura de Giros Ordinarios.docx', 'guia-para-apertura-de-negocios'],
  ['EMPRENDIMIENTO', 'Emprendimiento con Base Tecnologica .docx', 'emprendimientos-con-base-tecnologica'],
  ['EMPRENDIMIENTO', 'SARE (2).docx', 'mi-situacion-fiscal'],
  ['FERIAS Y EVENTOS ', 'Tianguis de productores .docx', 'tianguis-de-productores'],
  ['FERIAS Y EVENTOS ', 'Eventos y Festividades.docx', 'impulso-a-eventos-y-festividades'],
  ['FERIAS Y EVENTOS ', 'Foros, Congresos y Convenciones .docx', 'impulso-foros'],
  ['SECTOR INDUSTRIAL ', 'Clusters.docx', 'cluster'],
  ['SECTOR INDUSTRIAL ', 'Desarrollo de Proveedores en Chihuahua.docx', 'desarrollo-de-proveedores'],
  ['SECTOR INDUSTRIAL ', 'Inversión en Chihuahua.docx', 'atraccion-de-inversion'],
];

const SLUG_TITLE = {
  'fomech': 'FOMECH',
  'impulso-municipal': 'Impulso municipal',
  'proyectos-productivos': 'Proyectos productivos',
  'otros-programas-de-la-red': 'Otros programas de la red',
  'mifam': 'MIFAM',
  'ences': 'ENCES',
  'capital-de-emprendimiento': 'Capital de emprendimiento',
  'aulas-digitales': 'Aulas digitales',
  'incubech': 'INCUBECH',
  'becas-con-universidades': 'Becas con universidades',
  'branding': 'Branding',
  'propiedad-intelectual': 'Propiedad Intelectual',
  'sat-en-el-sare': 'SAT en el SARE',
  'guia-para-apertura-de-negocios': 'Guía para apertura de negocios',
  'emprendimientos-con-base-tecnologica': 'Emprendimientos con base tecnológica',
  'mi-situacion-fiscal': 'Mi situación fiscal',
  'tianguis-de-productores': 'Tianguis de productores',
  'impulso-a-eventos-y-festividades': 'Impulso a eventos y festividades',
  'impulso-foros': 'Foros, congresos y convenciones',
  'cluster': 'Clúster',
  'desarrollo-de-proveedores': 'Desarrollo de proveedores',
  'atraccion-de-inversion': 'Atracción de inversión',
};

async function extractDocx(docxPath) {
  const buf = fs.readFileSync(docxPath);
  const { value } = await mammoth.convertToHtml({ buffer: buf });
  return value;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function main() {
  if (!fs.existsSync(CONTENIDOS)) {
    console.error('No se encontró la carpeta contenidos:', CONTENIDOS);
    process.exit(1);
  }

  const data = {};

  for (const [folder, fileName, slug] of DOCX_TO_SLUG) {
    const fullPath = path.join(CONTENIDOS, folder, fileName);
    if (!fs.existsSync(fullPath)) {
      console.warn('No existe:', fullPath);
      continue;
    }
    console.log('Procesando:', fileName, '->', slug);
    try {
      const body = await extractDocx(fullPath);
      const title = SLUG_TITLE[slug] || slug;
      if (data[slug]) {
        data[slug].body += body;
      } else {
        data[slug] = { title, body: body || '<p>Sin contenido.</p>' };
      }
    } catch (e) {
      console.warn('Error en', fullPath, e.message);
    }
  }

  const js = `// Generado por scripts/import-contenidos.js - no editar a mano
export const cmsStatic = ${JSON.stringify(data, null, 2)};

export function getStaticPage(slug) {
  return cmsStatic[slug] || null;
}
`;
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, js, 'utf8');
  console.log('Escrito:', OUT_FILE);

  if (fs.existsSync(CONTENIDOS)) {
    copyDirRecursive(CONTENIDOS, PUBLIC_CONTENIDOS);
    console.log('Imágenes copiadas a:', PUBLIC_CONTENIDOS);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
