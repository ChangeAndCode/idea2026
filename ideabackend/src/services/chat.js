import { config } from '../config.js';

const { apiKey, model } = config.claude;

/**
 * Envía mensajes al modelo Claude (Anthropic).
 * Placeholder: cuando tengas CLAUDE_API_KEY se usará la API real.
 */
export async function chat(messages, systemPrompt = null) {
  if (!apiKey) {
    return {
      content: 'Chat no configurado. Añade CLAUDE_API_KEY en .env.',
      stopReason: 'end_turn',
    };
  }
  const body = {
    model,
    max_tokens: 1024,
    messages: messages.map((m) =>
      m.role === 'user'
        ? { role: 'user', content: m.content }
        : { role: 'assistant', content: m.content }
    ),
  };
  if (systemPrompt) body.system = systemPrompt;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  const block = data.content?.find((c) => c.type === 'text');
  return {
    content: block?.text ?? '',
    stopReason: data.stop_reason ?? 'end_turn',
  };
}
