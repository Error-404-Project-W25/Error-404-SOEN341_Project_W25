import { Request, Response } from 'express';
// import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

class UrlPreviewController {
  /**
   * Fetches metadata from a given URL using a link preview API and returns a preview.
   * @param req - Express request object
   * @param res - Express response object
   */
  async getUrlPreview(req: Request, res: Response): Promise<void> {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    try {
      let apiKey = process.env.LINKPREVIEW_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'API key is not configured' });
        return;
      }

      apiKey = apiKey.replace(/^['"]|['"]$/g, ''); // Remove any surrounding quotes

      const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(
        url
      )}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        res.status(200).json({
          title: data.title || 'No title available',
          description: data.description || 'No description available',
          image: data.image || 'No image available',
        });
      } else {
        console.error('LinkPreview API Error:', data.error || 'Unknown error');
        res
          .status(500)
          .json({ error: data.error || 'Failed to fetch URL preview' });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching URL preview:', error.message);
      } else {
        console.error('Error fetching URL preview:', error);
      }
      res.status(500).json({ error: 'Failed to fetch URL preview' });
    }
  }
}

export const getUrlPreview = new UrlPreviewController().getUrlPreview;
