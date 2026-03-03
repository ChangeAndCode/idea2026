import { Router } from 'express';
import { getAuth } from '@clerk/express';
import { createClerkClient } from '@clerk/backend';
import { getDb } from '../db/mongo.js';

const router = Router();

/** Solo rutas de modificación: exigen sesión Clerk. Si CLERK_SECRET_KEY no está definida, no se exige. */
function requireCmsAuth(req, res, next) {
  if (!process.env.CLERK_SECRET_KEY) return next();
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión en el CMS.' });
  }
  next();
}

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

/** Valores por defecto de la landing (página de inicio). */
const DEFAULT_LANDING = {
  heroTitle: '¡Bienvenido a tu nueva forma de conectar con Chihuahua!',
  heroSubtitle: 'Descubre eventos únicos y encuentra la chamba ideal con la ayuda de Chambabot, tu asistente inteligente.',
  heroMascotImg: '/assets/mascota/chambabot.png',
  heroCtaText: 'Buscador de empleo',
  heroLogos: [
    { src: '/assets/logos/escudo-municipio.png', alt: 'Escudo Municipio' },
    { src: '/assets/logos/logo-chihuahua-trabajo.png', alt: 'Chihuahua capital de trabajo y resultados' },
    { src: '/assets/logos/logo-idea.png', alt: 'IDEA' },
    { src: '/assets/logos/chihuahua-capital.png', alt: 'Chihuahua CAPITAL' },
  ],
  headlineText: 'Lo que pasa en Chihuahua,\nempieza aquí.',
  carouselSlides: [
    { type: 'image', img: '/assets/banners/promo-kolau.jpeg', alt: 'Sitio WEB GRATIS - Kolau', title: 'Sitio WEB GRATIS', subtitle: 'Con botón de pago' },
    { type: 'info', text: 'Conecta con experiencias, ideas y herramientas que pueden cambiar tu forma de ver la ciudad y la tecnología.', cta: 'Descubre más', sub: 'CURSOS, TALLERES Y CAPACITACIONES A EMPRENDEDORES CHIHUAHUENSES' },
    { type: 'image', img: '/assets/contenido/banner-fomech.jpeg', alt: 'FOMECH', title: 'FOMECH', subtitle: '¿Cuentas con una MiPyMe y buscas capital para crecer?' },
  ],
  ciudadHablaTitle: 'La ciudad habla.\n¿Ya la escuchaste?',
  ciudadHablaCards: [
    { title: 'Marketing digital y WhatsApp Web', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/capital-virtual.png', imgAlt: 'Capital Virtual', buttonText: 'Leer más', imageOnLeft: true },
    { title: 'Coppel Emprende', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/coppel-personas.jpg', imgAlt: 'Coppel Emprende', buttonText: 'Leer más', imageOnLeft: false },
    { title: 'Adquiere un crédito FOMECH', text: 'Forma parte del nuevo taller "Marketing Digital y WhatsApp Business" de Municipio; a través de este taller, las y los participantes aprenderán a utilizar la aplicación de WhatsApp para crear estrategias de marketing efectivas.', img: '/assets/contenido/banner-fomech.jpeg', imgAlt: 'FOMECH', buttonText: 'Leer más', imageOnLeft: true },
  ],
  buscasAtencionTitle: '¿Buscas atención?\nAquí nos encuentras',
  locations: [
    { name: 'MIFAM Porvenir', address: 'Mina Dolores & Mina Los Reyes, Porvenir, Rio Sacramento Nte, 31137 Chihuahua, Chih.' },
    { name: 'MIFAM Riberas del Sacramento', address: 'C. Río Amur esquina con Río Paraná, Chihuahua, Chih.' },
    { name: 'MIFAM Dale', address: 'C. Trigésimo Sexta 3402, Dale, RUTA SUR II, 31050 Chihuahua, Chih.' },
    { name: 'MIFAM Unidad Vallarta', address: '31120, Manuel González Cossío 7300, Nacional, Chihuahua, Chih.' },
  ],
};

function normalizeLanding(landing) {
  if (!landing || typeof landing !== 'object') return DEFAULT_LANDING;
  const slides = Array.isArray(landing.carouselSlides)
    ? landing.carouselSlides
        .filter((s) => s && (s.type === 'image' || s.type === 'info'))
        .map((s) => {
          if (s.type === 'info') {
            return {
              type: 'info',
              text: String(s.text ?? '').trim(),
              cta: String(s.cta ?? 'Descubre más').trim(),
              sub: String(s.sub ?? '').trim(),
            };
          }
          return {
            type: 'image',
            img: String(s.img ?? '').trim(),
            alt: String(s.alt ?? '').trim(),
            title: String(s.title ?? '').trim(),
            subtitle: String(s.subtitle ?? '').trim(),
          };
        })
    : DEFAULT_LANDING.carouselSlides;
  const cards = Array.isArray(landing.ciudadHablaCards)
    ? landing.ciudadHablaCards.slice(0, 20).map((c) => ({
        title: String(c?.title ?? '').trim(),
        text: String(c?.text ?? '').trim(),
        img: String(c?.img ?? '').trim(),
        imgAlt: String(c?.imgAlt ?? '').trim(),
        buttonText: String(c?.buttonText ?? 'Leer más').trim(),
        imageOnLeft: Boolean(c?.imageOnLeft),
      }))
    : DEFAULT_LANDING.ciudadHablaCards;
  const locs = Array.isArray(landing.locations)
    ? landing.locations.slice(0, 30).map((l) => ({
        name: String(l?.name ?? '').trim(),
        address: String(l?.address ?? '').trim(),
      }))
    : DEFAULT_LANDING.locations;
  const heroLogos = Array.isArray(landing.heroLogos)
    ? landing.heroLogos.slice(0, 12).map((logo) => ({
        src: String(logo?.src ?? '').trim() || '#',
        alt: String(logo?.alt ?? '').trim(),
      }))
    : DEFAULT_LANDING.heroLogos;
  return {
    heroTitle: String(landing.heroTitle ?? DEFAULT_LANDING.heroTitle).trim() || DEFAULT_LANDING.heroTitle,
    heroSubtitle: String(landing.heroSubtitle ?? DEFAULT_LANDING.heroSubtitle).trim() || DEFAULT_LANDING.heroSubtitle,
    heroMascotImg: String(landing.heroMascotImg ?? DEFAULT_LANDING.heroMascotImg).trim() || DEFAULT_LANDING.heroMascotImg,
    heroCtaText: String(landing.heroCtaText ?? DEFAULT_LANDING.heroCtaText).trim() || DEFAULT_LANDING.heroCtaText,
    heroLogos: heroLogos.length ? heroLogos : DEFAULT_LANDING.heroLogos,
    headlineText: String(landing.headlineText ?? DEFAULT_LANDING.headlineText).trim() || DEFAULT_LANDING.headlineText,
    carouselSlides: slides.length ? slides : DEFAULT_LANDING.carouselSlides,
    ciudadHablaTitle: String(landing.ciudadHablaTitle ?? DEFAULT_LANDING.ciudadHablaTitle).trim() || DEFAULT_LANDING.ciudadHablaTitle,
    ciudadHablaCards: cards.length ? cards : DEFAULT_LANDING.ciudadHablaCards,
    buscasAtencionTitle: String(landing.buscasAtencionTitle ?? DEFAULT_LANDING.buscasAtencionTitle).trim() || DEFAULT_LANDING.buscasAtencionTitle,
    locations: locs.length ? locs : DEFAULT_LANDING.locations,
  };
}

/** GET configuración del sitio (navegación, logos, landing). Si no existe, devuelve valores por defecto. */
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
          landing: normalizeLanding(doc.landing),
        }
      : { ...DEFAULT_SITE_CONFIG, landing: DEFAULT_LANDING };
    if (!payload.landing) payload.landing = DEFAULT_LANDING;
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

/** PUT actualiza la configuración del sitio. Acepta navItems (array) y opcionalmente logoMunicipio, logoIdea, logoChihuahua. */
router.put('/site', requireCmsAuth, async (req, res, next) => {
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
    if (body.landing !== undefined) update.landing = normalizeLanding(body.landing);

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
      landing: normalizeLanding(doc?.landing),
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
router.post('/pages', requireCmsAuth, async (req, res, next) => {
  try {
    const { slug, title, body, image } = req.body || {};
    if (!slug || !title) return res.status(400).json({ error: 'Faltan slug o title' });
    const db = await getDb();
    const col = db.collection('cms_pages');
    const existing = await col.findOne({ slug });
    if (existing) return res.status(409).json({ error: 'Ya existe una página con ese slug' });
    const now = new Date();
    const doc = { slug, title, body: body ?? '', image: image ?? '', created_at: now, updated_at: now };
    await col.insertOne(doc);
    const { _id, ...rest } = doc;
    res.status(201).json({ id: _id?.toString(), ...rest });
  } catch (err) {
    next(err);
  }
});

/** Actualiza una página por slug */
router.put('/pages/:slug', requireCmsAuth, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { title, body, image } = req.body || {};
    const db = await getDb();
    const col = db.collection('cms_pages');
    const update = { updated_at: new Date() };
    if (title !== undefined) update.title = title;
    if (body !== undefined) update.body = body;
    if (image !== undefined) update.image = image ?? '';
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
router.delete('/pages/:slug', requireCmsAuth, async (req, res, next) => {
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

const CLERK_API = 'https://api.clerk.com/v1';

async function clerkRequest(method, path, body = null) {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error('CLERK_SECRET_KEY no configurada');
  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${CLERK_API}${path}`, opts);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data.errors?.[0]?.message || data.errors?.[0]?.long_message || data.message || `Clerk API ${r.status}`;
    throw new Error(msg);
  }
  return data;
}

/** Lista usuarios de Clerk (quienes pueden acceder al CMS). Requiere auth. */
router.get('/users', requireCmsAuth, async (req, res, next) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) return res.json([]);
    const data = await clerkRequest('GET', '/users?limit=100');
    const list = Array.isArray(data) ? data : data.data || [];
    res.json(
      list.map((u) => ({
        id: u.id,
        email: u.email_addresses?.[0]?.email_address ?? '',
        firstName: u.first_name ?? '',
        lastName: u.last_name ?? '',
        createdAt: u.created_at,
      }))
    );
  } catch (err) {
    next(err);
  }
});

/** Crea un usuario en Clerk (nombre, correo, contraseña temporal). Requiere auth. Usa SDK oficial. */
router.post('/users', requireCmsAuth, async (req, res, next) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) return res.status(503).json({ error: 'Configura CLERK_SECRET_KEY en el backend para crear usuarios.' });
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Faltan correo o contraseña' });
    if (String(password).length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    const emailVal = String(email).trim().toLowerCase();
    const firstVal = (firstName != null && String(firstName).trim()) || undefined;
    const lastVal = (lastName != null && String(lastName).trim()) || undefined;

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.createUser({
      emailAddress: [emailVal],
      password: String(password),
      firstName: firstVal,
      lastName: lastVal,
      // Si Clerk rechaza la contraseña por política de complejidad, omitir comprobaciones
      skipPasswordChecks: true,
    });

    const emails = user.emailAddresses ?? user.email_addresses ?? [];
    const primaryEmail = emails[0]?.emailAddress ?? emails[0]?.email_address ?? emailVal;
    res.status(201).json({
      id: user.id,
      email: primaryEmail,
      firstName: user.firstName ?? user.first_name ?? '',
      lastName: user.lastName ?? user.last_name ?? '',
    });
  } catch (err) {
    const status = err.statusCode ?? err.status ?? 422;
    const errors = err.errors ?? err.data?.errors ?? err.body?.errors ?? [];
    const first = errors[0];
    const msg =
      first?.longMessage ??
      first?.message ??
      (err.message && err.message !== 'Unprocessable Entity' ? err.message : null) ??
      'No se pudo crear el usuario. Revisa que el correo no esté ya registrado y que la contraseña tenga al menos 8 caracteres.';
    if (process.env.NODE_ENV !== 'production') {
      console.error('Clerk createUser error:', status, errors.length ? errors : err.message, err);
    }
    err.status = status;
    err.message = msg;
    next(err);
  }
});

export default router;
