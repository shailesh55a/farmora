import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature');
    url.searchParams.set('daily', 'precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code');
    url.searchParams.set('forecast_days', '4');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo upstream error: ${response.status}`);
    }

    const data = await response.json();
    return res.json({
      source: 'Open-Meteo',
      current: data.current || null,
      daily: data.daily || null,
      hourly: data.hourly || null,
      timezone: data.timezone || null,
    });
  } catch (error) {
    console.error('Weather route error:', error);
    return res.status(500).json({ error: 'Unable to load live weather right now.' });
  }
});

export default router;
