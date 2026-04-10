import { config } from '../config.js';
import { searchJobs } from './jsearch.js';

const MAX_AGENT_STEPS = 8;

const TOOLS = [
  {
    name: 'search_jobs',
    description:
      'Busca ofertas reales en JSearch. Úsalo cuando el usuario dé contexto suficiente: (a) rol/área + remoto explícito, o (b) rol/área + ciudad/región/país. Query corta: rol + lugar o remote + stack/área. Si totalReturned es 0 o los empleos no encajan, no inventes: pregunta al usuario una cosa para afinar y vuelve a llamar con la nueva información; no amplíes la query por tu cuenta solo para rellenar.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Frase de búsqueda: puesto/área + ubicación o remote + stack.',
        },
        country: {
          type: 'string',
          description: 'ISO 3166-1 alpha-2 (MX, US, etc.). Por defecto MX.',
        },
        remote_only: {
          type: 'boolean',
          description: 'true si solo acepta trabajo remoto.',
        },
      },
      required: ['query'],
    },
  },
];

function toAnthropicMessages(msgs) {
  return msgs
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        m.content != null &&
        String(m.content).trim() !== ''
    )
    .map((m) => ({
      role: m.role,
      content: [{ type: 'text', text: String(m.content) }],
    }));
}

async function callAnthropic({ system, messages, tools }) {
  const { apiKey, model } = config.claude;
  const body = {
    model,
    max_tokens: 2048,
    messages,
    ...(system ? { system } : {}),
    ...(tools?.length ? { tools } : {}),
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    data = {};
  }
  if (!res.ok) {
    const msg = data.error?.message || JSON.stringify(data) || res.statusText;
    throw new Error(`Claude API ${res.status}: ${msg}`);
  }
  return data;
}

function runSearchJobsTool(input) {
  const query = String(input?.query ?? '').trim();
  if (!query) {
    return JSON.stringify({ success: false, error: 'query vacía' });
  }
  let country = String(input?.country ?? 'MX')
    .trim()
    .toUpperCase()
    .slice(0, 2);
  if (!/^[A-Z]{2}$/.test(country)) country = 'MX';

  const opts = {
    query,
    country,
    page: 1,
    num_pages: 2,
    date_posted: 'week',
  };
  if (input?.remote_only === true) opts.work_from_home = true;

  return searchJobs(opts)
    .then((jobs) => {
      const slim = jobs.slice(0, 20).map((j) => ({
        jobId: j.jobId,
        title: j.title,
        companyName: j.companyName,
        location: j.location,
        isRemote: j.isRemote,
        employmentType: j.employmentType,
        postedAt: j.postedAt,
        applyLink: j.applyLink,
      }));
      return JSON.stringify({
        success: true,
        totalReturned: slim.length,
        jobs: slim,
      });
    })
    .catch((e) =>
      JSON.stringify({
        success: false,
        error: e.message || 'Error al buscar',
      })
    );
}

/**
 * Chat Bolsa: Claude con herramienta search_jobs → JSearch.
 */
export async function chat(messages, systemPrompt = null) {
  if (!config.claude.apiKey) {
    return {
      content:
        'Chat no configurado. Añade CLAUDE_API_KEY en el .env del backend (ideabackend).',
      stopReason: 'end_turn',
    };
  }

  let anthropicMessages = toAnthropicMessages(messages);
  if (anthropicMessages.length === 0) {
    return { content: 'Envía un mensaje para comenzar.', stopReason: 'end_turn' };
  }

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    const data = await callAnthropic({
      system: systemPrompt,
      messages: anthropicMessages,
      tools: TOOLS,
    });

    const stopReason = data.stop_reason;
    const content = data.content || [];

    if (stopReason === 'tool_use') {
      anthropicMessages.push({ role: 'assistant', content });
      const toolResults = [];
      for (const block of content) {
        if (block.type !== 'tool_use') continue;
        let out;
        if (block.name === 'search_jobs') {
          out = await runSearchJobsTool(block.input || {});
        } else {
          out = JSON.stringify({
            success: false,
            error: `Herramienta desconocida: ${block.name}`,
          });
        }
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: out,
        });
      }
      if (toolResults.length === 0) {
        anthropicMessages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'No hubo llamadas a herramientas válidas. Usa search_jobs cuando tengas rol y ubicación o remoto.',
            },
          ],
        });
        continue;
      }
      anthropicMessages.push({ role: 'user', content: toolResults });
      continue;
    }

    const text = content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
      .trim();
    return {
      content: text || 'Sin respuesta del asistente.',
      stopReason: stopReason || 'end_turn',
    };
  }

  return {
    content:
      'Se alcanzó el límite de pasos. Escribe de nuevo indicando puesto y ciudad (o si buscas solo remoto).',
    stopReason: 'end_turn',
  };
}
