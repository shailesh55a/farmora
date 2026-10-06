import { Router } from 'express';
import { findVerifiedProducts, loadFertilizers, loadTreatments } from '../lib/agriculture.js';

const router = Router();
const dataPolicy = {
  sourcePolicy: 'Verified crop and product references are limited to local JSON data and should be checked against the product label and local extension advice.'
};

router.get('/products', (req, res) => {
  try {
    const { question = '', crop = '', category = '', disease = '' } = req.query;
    const entries = findVerifiedProducts({
      question: String(question),
      crop: String(crop),
      category: String(category),
      disease: String(disease),
    });

    res.json({
      ...dataPolicy,
      entries,
    });
  } catch (error) {
    console.error('Agriculture /products error:', error);
    res.status(500).json({ error: 'Unable to load verified products right now.' });
  }
});

router.get('/fertilizers', (req, res) => {
  try {
    const data = loadFertilizers();
    res.json({ entries: data.entries || [] });
  } catch (error) {
    console.error('Agriculture /fertilizers error:', error);
    res.status(500).json({ error: 'Unable to load fertilizer guidance.' });
  }
});

router.get('/treatments', (req, res) => {
  try {
    const data = loadTreatments();
    res.json({ entries: data.entries || [] });
  } catch (error) {
    console.error('Agriculture /treatments error:', error);
    res.status(500).json({ error: 'Unable to load treatment guidance.' });
  }
});

export default router;
