import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-article.ts';
import '@/ai/flows/analyze-image.ts';
import '@/ai/flows/start-conversation.ts';