import { Request, Response } from 'express';
import https from 'https';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY; // Store your Giphy API key in an environment variable
const GIPHY_API_URL = 'https://api.giphy.com/v1/gifs/search';
const GIPHY_TRENDING_URL = 'https://api.giphy.com/v1/gifs/trending';

export const searchGif = async (
  req: Request,
  res: Response
): Promise<Response | undefined> => {
  const query = req.params.query;

  // Check if the Giphy API key is configured
  if (!GIPHY_API_KEY) {
    return res.status(500).json({ error: 'Giphy API key is not configured' });
  }

  try {
    const apiUrl = query === 'trending' ? GIPHY_TRENDING_URL : GIPHY_API_URL;
    const params = new URLSearchParams({
      api_key: GIPHY_API_KEY,
      ...(query !== 'trending' && { q: query }),
      limit: '25', // Limit the number of GIFs returned
    });

    const url = `${apiUrl}?${params.toString()}`;

    https
      .get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            const gifs = jsonData.data.map((gif: any) => ({
              url: gif.images.original.url,
              title: gif.title,
            }));

            return res.status(200).json({ gifs });
          } catch (error) {
            console.error('Error parsing GIF data:', error);
            return res
              .status(500)
              .json({ error: 'Failed to parse GIF data from Giphy API' });
          }
        });
      })
      .on('error', (error) => {
        console.error('Error fetching GIFs:', error);
        return res
          .status(500)
          .json({ error: 'An unexpected error occurred while fetching GIFs' });
      });
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    return res
      .status(500)
      .json({ error: 'An unexpected error occurred while fetching GIFs' });
  }
};
