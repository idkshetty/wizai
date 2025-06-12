import express from 'express';
import cors from 'cors';
import { startConversation, StartConversationInput, StartConversationOutput } from './flows/start-conversation';
import { analyzeImage, AnalyzeImageInput, AnalyzeImageOutput } from './flows/analyze-image';
import { summarizeArticle, SummarizeArticleInput, SummarizeArticleOutput } from './flows/summarize-article';

const app = express();
const port = 3001;

// Enable CORS for all routes and origins
app.use(cors());

// Middleware to parse JSON bodies
// Increase payload limit for data URIs in analyze-image
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// POST endpoint for chat
app.post('/api/chat', async (req: express.Request, res: express.Response) => {
  try {
    // It's good practice to validate req.body against a schema if possible,
    // but Genkit flows will do this internally.
    // For stricter typing here, you could use:
    // const input: StartConversationInput = req.body as StartConversationInput;
    // Or use a type guard. For now, direct assignment is okay if req.body is `any`.
    const input: StartConversationInput = req.body;
    if (!input.query) {
      return res.status(400).json({ error: 'Missing query in request body' });
    }
    const output: StartConversationOutput = await startConversation(input);
    res.json(output);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    if (error.issues && Array.isArray(error.issues)) { // Zod validation error
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST endpoint for image analysis
app.post('/api/analyze-image', async (req: express.Request, res: express.Response) => {
  try {
    const input: AnalyzeImageInput = req.body;
    if (!input.photoDataUri) {
      return res.status(400).json({ error: 'Missing photoDataUri in request body' });
    }
    // Basic check for data URI format
    if (!input.photoDataUri.startsWith('data:image/') || !input.photoDataUri.includes(';base64,')) {
        return res.status(400).json({ error: 'Invalid photoDataUri format. Expected data:image/...;base64,...' });
    }
    const output: AnalyzeImageOutput = await analyzeImage(input);
    res.json(output);
  } catch (error: any) {
    console.error('Error in /api/analyze-image:', error);
    if (error.issues && Array.isArray(error.issues)) { // Zod validation error
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST endpoint for article summarization
app.post('/api/summarize-article', async (req: express.Request, res: express.Response) => {
  try {
    const input: SummarizeArticleInput = req.body;
    if (!input.article) {
      return res.status(400).json({ error: 'Missing article in request body' });
    }
    const output: SummarizeArticleOutput = await summarizeArticle(input);
    res.json(output);
  } catch (error: any) {
    console.error('Error in /api/summarize-article:', error);
    if (error.issues && Array.isArray(error.issues)) { // Zod validation error
      return res.status(400).json({
        error: 'Invalid request body',
        details: error.issues.map((issue: any) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port} with payload limit 10mb`);
});
