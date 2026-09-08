import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { analyzeTraineeData, analyzeProgramLevelData } from './server/geminiAi';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      geminiConfigured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 1. Individual Trainee Skill Gap & Career Risk Analysis
  app.post('/api/ai/analyze-trainee', async (req, res) => {
    try {
      const { trainee } = req.body;
      if (!trainee) {
        return res.status(400).json({ error: 'Missing trainee data in request body.' });
      }

      if (!trainee.id || !trainee.name) {
        return res.status(400).json({ error: 'Trainee record must contain a valid SkillTrack ID and Name.' });
      }

      const result = await analyzeTraineeData(trainee);
      return res.json(result);
    } catch (err: any) {
      console.error('[Server Error] /api/ai/analyze-trainee:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to complete AI Career Intelligence analysis for candidate.'
      });
    }
  });

  // 2. Program-Level Aggregated Insights
  app.post('/api/ai/program-insights', async (req, res) => {
    try {
      const { trainees } = req.body;
      if (!trainees || !Array.isArray(trainees) || trainees.length === 0) {
        return res.status(400).json({ error: 'Missing or empty trainees cohort array in request body.' });
      }

      const result = await analyzeProgramLevelData(trainees);
      return res.json(result);
    } catch (err: any) {
      console.error('[Server Error] /api/ai/program-insights:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to generate program-level AI cohort insights.'
      });
    }
  });

  // Vite middleware in development vs static file serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SkillTrack Directorate Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
