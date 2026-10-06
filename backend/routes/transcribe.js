import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  const message = 'use browser voice input';
  return res.status(501).json({ error: message });
});

export default router;
