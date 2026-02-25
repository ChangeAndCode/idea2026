/** Configuración desde variables de entorno */
export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  jsearch: {
    baseUrl: 'https://jsearch.p.rapidapi.com',
    apiKey: process.env.RAPIDAPI_JSEARCH_KEY ?? '',
    host: 'jsearch.p.rapidapi.com',
  },

  claude: {
    apiKey: process.env.CLAUDE_API_KEY ?? '',
    model: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-20250514',
  },

  mongodb: {
    uri: (process.env.MONGODB_URI ?? '').trim(),
  },
};
