import express from 'express';
import { getUrlPreview } from '../controllers/urlPreviewController';

const router = express.Router();

// Route to handle URL preview
router.post('/preview', getUrlPreview);

export default router;
