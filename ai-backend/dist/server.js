"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const start_conversation_1 = require("./flows/start-conversation");
const analyze_image_1 = require("./flows/analyze-image");
const summarize_article_1 = require("./flows/summarize-article");
const app = (0, express_1.default)();
const port = 3001;
// Middleware to parse JSON bodies
// Increase payload limit for data URIs in analyze-image
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// POST endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        // It's good practice to validate req.body against a schema if possible,
        // but Genkit flows will do this internally.
        // For stricter typing here, you could use:
        // const input: StartConversationInput = req.body as StartConversationInput;
        // Or use a type guard. For now, direct assignment is okay if req.body is `any`.
        const input = req.body;
        if (!input.query) {
            return res.status(400).json({ error: 'Missing query in request body' });
        }
        const output = await (0, start_conversation_1.startConversation)(input);
        res.json(output);
    }
    catch (error) {
        console.error('Error in /api/chat:', error);
        if (error.issues && Array.isArray(error.issues)) { // Zod validation error
            return res.status(400).json({
                error: 'Invalid request body',
                details: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }))
            });
        }
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});
// POST endpoint for image analysis
app.post('/api/analyze-image', async (req, res) => {
    try {
        const input = req.body;
        if (!input.photoDataUri) {
            return res.status(400).json({ error: 'Missing photoDataUri in request body' });
        }
        // Basic check for data URI format
        if (!input.photoDataUri.startsWith('data:image/') || !input.photoDataUri.includes(';base64,')) {
            return res.status(400).json({ error: 'Invalid photoDataUri format. Expected data:image/...;base64,...' });
        }
        const output = await (0, analyze_image_1.analyzeImage)(input);
        res.json(output);
    }
    catch (error) {
        console.error('Error in /api/analyze-image:', error);
        if (error.issues && Array.isArray(error.issues)) { // Zod validation error
            return res.status(400).json({
                error: 'Invalid request body',
                details: error.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                }))
            });
        }
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});
// POST endpoint for article summarization
app.post('/api/summarize-article', async (req, res) => {
    try {
        const input = req.body;
        if (!input.article) {
            return res.status(400).json({ error: 'Missing article in request body' });
        }
        const output = await (0, summarize_article_1.summarizeArticle)(input);
        res.json(output);
    }
    catch (error) {
        console.error('Error in /api/summarize-article:', error);
        if (error.issues && Array.isArray(error.issues)) { // Zod validation error
            return res.status(400).json({
                error: 'Invalid request body',
                details: error.issues.map((issue) => ({
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
