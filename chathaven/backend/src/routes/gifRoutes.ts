import express from 'express';
import { searchGif } from '../controllers/gifController';

const router = express.Router();

router.get('/search/:query', async (req, res, next) => {
  try {
    await searchGif(req, res);
  } catch (error) {
    next(error); // Pass errors to the error-handling middleware
  }
});

export default router;
