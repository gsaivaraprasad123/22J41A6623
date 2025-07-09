import express from 'express';
import { createShortUrl, getShortUrlStats } from '../services/shortener.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { url, validity, shortcode } = req.body;
    const host = `${req.protocol}://${req.get('host')}`;
    const result = await createShortUrl(url, validity, shortcode, host);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:shortcode', async (req, res) => {
  const stats = await getShortUrlStats(req.params.shortcode);
  if (!stats) return res.status(404).json({ error: 'Shortcode not found' });
  res.json(stats);
});

export default router;
