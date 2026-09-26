/**
 * Vercel Function: POST /api/genai
 *
 * Thin adapter around the GenAI gateway. Configure `GEMINI_API_KEY` (and
 * optionally `GEMINI_MODEL`) as Vercel environment variables.
 */
import { handleGenAIRequest } from '../server/genai.js';

export const config = { maxDuration: 60 };

export function POST(request: Request): Promise<Response> {
  return handleGenAIRequest(request, process.env);
}
