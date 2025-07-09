import express from 'express';
import dotenv from 'dotenv';
import { loggerMiddleware } from './middleware/logger.js';
import shortUrlRoutes from './routes/shorturls.js';
import { setupDB } from './db.js';
import { handleRedirect } from './services/shortener.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

global.db = await setupDB();

app.use(express.json());
app.use(loggerMiddleware);

app.use('/shorturls', shortUrlRoutes);

app.get('/:shortcode', async (req, res) => {
  const result = await handleRedirect(req.params.shortcode, req.get('Referer'), req.ip);
  if (result === null) return res.status(404).json({ error: 'Shortcode not found' });
  if (result === 'expired') return res.status(410).json({ error: 'Shortlink expired' });

  res.redirect(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
