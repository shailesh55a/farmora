import { Router } from 'express';

const router = Router();

router.get('/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    const limit = Math.min(6, Math.max(1, Number(req.query.limit) || 4));

    if (!query) {
      return res.status(400).json({ error: 'Search term "q" is required.' });
    }

    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.searchParams.set('action', 'query');
    url.searchParams.set('generator', 'search');
    url.searchParams.set('gsrsearch', query);
    url.searchParams.set('gsrnamespace', '6');
    url.searchParams.set('gsrlimit', String(limit));
    url.searchParams.set('prop', 'imageinfo');
    url.searchParams.set('iiurlwidth', '640');
    url.searchParams.set('iiprop', 'url|extmetadata');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Farmora/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ images: [], source: 'Wikimedia Commons', reason: 'Image search service unavailable.' });
    }

    const data = await response.json();
    const pages = data?.query?.pages || {};
    const images = Object.values(pages)
      .map((page) => {
        const info = Array.isArray(page.imageinfo) ? page.imageinfo[0] : null;
        const sourceUrl = info?.descriptionurl || info?.url || '';
        return {
          title: page.title || '',
          thumbnailUrl: info?.thumburl || '',
          url: info?.url || '',
          sourceUrl,
          source: 'Wikimedia Commons',
        };
      })
      .filter((image) => image.title || image.thumbnailUrl || image.url || image.sourceUrl);

    return res.json({ images, source: 'Wikimedia Commons' });
  } catch (error) {
    console.error('Image search route error:', error);
    return res.status(200).json({ images: [], source: 'Wikimedia Commons', reason: 'Image search service unavailable.' });
  }
});

export default router;
