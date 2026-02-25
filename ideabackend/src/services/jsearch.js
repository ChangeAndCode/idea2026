import { config } from '../config.js';

const { baseUrl, apiKey, host } = config.jsearch;

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
  params.set('date_posted', opts.date_posted ?? 'all');

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
  const items = data?.data ?? [];
  return items.map(normalizeJob);
}

function normalizeJob(j) {
  return {
    jobId: j.job_id,
    title: j.job_title,
    companyName: j.employer_name,
    description: j.job_description,
    employmentType: j.job_employment_type,
    applyLink: j.job_apply_link,
    isRemote: j.job_is_remote ?? false,
    postedAt: j.job_posted_at_datetime_utc,
    location: [j.job_city, j.job_state, j.job_country].filter(Boolean).join(', '),
    country: j.job_country,
  };
}
