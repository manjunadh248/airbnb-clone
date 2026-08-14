// ==============================
// OpenAI Client Initialization
// Falls back to demo mode when no API key is set
// ==============================

import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

/** Whether real AI is available (API key configured) */
export const isAIEnabled = Boolean(apiKey && apiKey !== 'demo');

/** OpenAI client — only use when isAIEnabled is true */
export const openai = new OpenAI({
  apiKey: apiKey || 'demo-key-not-set',
});

export default openai;
