import { Router } from 'express';
import { chat } from '../services/chat.js';

const router = Router();

const SYSTEM_PROMPT = `Eres un asistente de la Bolsa de Empleo del Municipio de Chihuahua. Ayudas a las personas a buscar empleo. Puedes hacer búsquedas de vacantes cuando el usuario lo pida. Responde en español, de forma clara y breve.`;

/**
 * POST /api/chat
 * Body: { messages: [ { role: "user"|"assistant", content: string } ] }
 */
router.post('/', async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Se requiere messages[]' });
  }
  const result = await chat(messages, SYSTEM_PROMPT);
  res.json({ content: result.content, stopReason: result.stopReason });
});

export default router;
