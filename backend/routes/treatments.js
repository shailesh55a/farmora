import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'treatments.json');
const router = Router();

router.get('/', (req, res) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const crop = String(req.query.crop || '').trim().toLowerCase();
    const disease = String(req.query.disease || '').trim().toLowerCase();

    const entries = (data.entries || []).filter((entry) => {
      const entryCrop = String(entry.crop || '').toLowerCase();
      const entryDisease = String(entry.disease || '').toLowerCase();

      const matchesCrop = !crop || entryCrop === crop;
      const matchesDisease = !disease || entryDisease === disease;
      return matchesCrop && matchesDisease;
    });

    res.json({ version: data.version || 'unknown', entries });
  } catch (error) {
    console.error('Treatments route error:', error);
    res.status(500).json({ error: 'Unable to load treatment recommendations right now.' });
  }
});

export default router;
