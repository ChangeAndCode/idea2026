import { config } from '../config.js';

const { baseUrl, apiKey, host } = config.jsearch;

/** Publicadores que suelen reenviar ofertas y caducan antes (prioridad baja). */
function publisherTier(publisher) {
  if (!publisher) return 3;
  const p = String(publisher).toLowerCase();
  if (/jooble|jobrapido|trabajo\.org|recruit\.net|theladders|ladders\.com|bebee/i.test(p)) return 1;
  if (/linkedin|indeed|glassdoor|monster|ziprecruiter|zip recruiter|talent\.com|computrabajo|bumeran|elempleo|occ mundial/i.test(p))
    return 5;
  return 4;
}

function applyOptionScore(o) {
  const t = publisherTier(o.publisher);
  const d = o.is_direct ? 1 : 0;
  return t * 100 + d * 10;
}

/**
 * Elige el enlace de postulación más fiable usando apply_options (JSearch / Google for Jobs).
 */
function pickApplyLink(j) {
  const options = (Array.isArray(j.apply_options) ? j.apply_options : []).filter(
    (o) => o && typeof o.apply_link === 'string' && /^https?:\/\//i.test(o.apply_link)
  );
  if (options.length > 0) {
    const sorted = [...options].sort((a, b) => applyOptionScore(b) - applyOptionScore(a));
    return sorted[0].apply_link;
  }
  const fallback = j.job_apply_link;
  if (typeof fallback === 'string' && /^https?:\/\//i.test(fallback)) return fallback;
  return null;
}

function isOfferExpired(j) {
  const exp = j.job_offer_expiration_datetime_utc;
  if (!exp || typeof exp !== 'string') return false;
  const t = Date.parse(exp);
  return !Number.isNaN(t) && t < Date.now();
}

function normalizeJob(j) {
  return {
    jobId: j.job_id,
    title: j.job_title,
    companyName: j.employer_name,
    description: j.job_description,
    employmentType: j.job_employment_type,
    applyLink: pickApplyLink(j),
    applyQualityScore: typeof j.job_apply_quality_score === 'number' ? j.job_apply_quality_score : null,
    googleLink: j.job_google_link || null,
    isRemote: j.job_is_remote ?? false,
    postedAt: j.job_posted_at_datetime_utc,
    offerExpiresAt: j.job_offer_expiration_datetime_utc || null,
    location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
    country: j.job_country,
  };
}

function sortJobs(jobs) {
  return [...jobs].sort((a, b) => {
    const tb = Date.parse(b.postedAt || '') || 0;
    const ta = Date.parse(a.postedAt || '') || 0;
    if (tb !== ta) return tb - ta;
    const qb = b.applyQualityScore ?? -1;
    const qa = a.applyQualityScore ?? -1;
    return qb - qa;
  });
}

/**
 * Busca ofertas en JSearch (RapidAPI).
 * @param {Object} opts - query, country, employment_type, work_from_home, page, num_pages, date_posted
 * @returns {Promise<Array>} lista de ofertas
 */
export async function searchJobs(opts = {}) {
  if (!apiKey) {
    throw new Error('RAPIDAPI_JSEARCH_KEY no configurada');
  }
  const params = new URLSearchParams();
  if (opts.query) params.set('query', opts.query);
  if (opts.country) params.set('country', opts.country);
  if (opts.employment_type) params.set('employment_type', opts.employment_type);
  if (opts.work_from_home !== undefined) params.set('work_from_home', opts.work_from_home);
  params.set('page', String(opts.page ?? 1));
  params.set('num_pages', String(opts.num_pages ?? 1));
  params.set('date_posted', opts.date_posted ?? 'week');

  const url = `${baseUrl}/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': host,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JSearch error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const items = (data?.data ?? []).filter((j) => j && !isOfferExpired(j));
  const normalized = items.map(normalizeJob).filter((job) => job.applyLink);
  return sortJobs(normalized);
}
