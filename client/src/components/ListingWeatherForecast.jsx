import { useEffect, useMemo, useState } from 'react';
import { SunIcon, MapPinIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

const getWeather = (code) => {
  if (code === 0) return { label: 'Clear', icon: '☀️' };
  if ([1, 2].includes(code)) return { label: 'Partly cloudy', icon: '🌤️' };
  if (code === 3) return { label: 'Cloudy', icon: '☁️' };
  if ([45, 48].includes(code)) return { label: 'Fog', icon: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', icon: '🌦️' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', icon: '🌧️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: '⛈️' };
  return { label: 'Variable', icon: '🌥️' };
};

const getNextWeekRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const daysToNextMonday = ((8 - start.getDay()) % 7) || 7;
  start.setDate(start.getDate() + daysToNextMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const toDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  return { start, startKey: toDateKey(start), endKey: toDateKey(end) };
};

const SOUTH_AFRICAN_PROVINCES = new Set([
  'eastern cape', 'free state', 'gauteng', 'kwazulu-natal', 'limpopo',
  'mpumalanga', 'north west', 'northern cape', 'western cape',
]);

const getLocationParts = (value) => String(value || '')
  .split(',')
  .map((part) => part.replace(/\b\d{4,}\b/g, '').trim())
  .filter((part) => part && !/^(south africa|za)$/i.test(part));

const getLocationQuery = (listing) => {
  const sources = [listing?.city, listing?.locationName, listing?.address, typeof listing?.location === 'string' ? listing.location : ''];
  for (const source of sources) {
    const parts = getLocationParts(source);
    if (!parts.length) continue;
    const last = parts.at(-1);
    const isProvince = SOUTH_AFRICAN_PROVINCES.has(last.toLowerCase());
    if (parts.length === 1 && isProvince) continue;
    const area = parts.length > 1 && isProvince ? parts.at(-2) : last;
    return area && !/south africa/i.test(area) ? `${area}, South Africa` : area;
  }
  return '';
};

const getLocationQueries = (listing) => {
  const candidates = [];
  const sources = [listing?.city, listing?.locationName, listing?.address, typeof listing?.location === 'string' ? listing.location : ''];
  for (const source of sources) {
    const parts = getLocationParts(source).filter((part) => !/\d/.test(part));
    if (!parts.length) continue;
    const province = parts.find((part) => SOUTH_AFRICAN_PROVINCES.has(part.toLowerCase()));
    const city = province ? parts[parts.indexOf(province) - 1] : parts.at(-1);
    if (city) candidates.push(`${city}${province ? `, ${province}` : ''}, South Africa`);
    candidates.push(...parts.slice().reverse().map((part) => `${part}, South Africa`));
  }
  return [...new Set(candidates)];
};

async function getCoordinates(listing, signal) {
  const coordinates = Array.isArray(listing?.coordinates) ? listing.coordinates : null;
  const latitudeValue = listing?.latitude ?? listing?.lat ?? listing?.location?.lat ?? (coordinates ? coordinates[1] : undefined);
  const longitudeValue = listing?.longitude ?? listing?.lng ?? listing?.location?.lng ?? (coordinates ? coordinates[0] : undefined);
  const hasCoordinateValues = latitudeValue !== undefined && latitudeValue !== null && String(latitudeValue).trim() !== ''
    && longitudeValue !== undefined && longitudeValue !== null && String(longitudeValue).trim() !== '';
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);
  if (hasCoordinateValues && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
    return { latitude, longitude };
  }

  const queries = getLocationQueries(listing);
  if (!queries.length) throw new Error('This listing does not have a location for a forecast.');
  let result = null;
  for (const name of queries) {
    const params = new URLSearchParams({ name, count: '1', language: 'en', format: 'json' });
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
    if (!response.ok) continue;
    const data = await response.json();
    result = data.results?.[0] || null;
    if (result) break;
  }
  if (!result) throw new Error('Could not find this listing area.');
  return { latitude: result.latitude, longitude: result.longitude, placeName: [result.name, result.admin1].filter(Boolean).join(', ') };
}

export default function ListingWeatherForecast({ listing }) {
  const [forecast, setForecast] = useState([]);
  const [placeName, setPlaceName] = useState('');
  const [status, setStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const weekRange = useMemo(getNextWeekRange, []);
  const locationLabel = getLocationQuery(listing).replace(/, South Africa$/i, '') || 'this area';

  useEffect(() => {
    if (!listing) return undefined;
    const controller = new AbortController();
    let isCurrent = true;

    const loadForecast = async () => {
      setStatus('loading');
      try {
        const coordinates = await getCoordinates(listing, controller.signal);
        const params = new URLSearchParams({
          latitude: String(coordinates.latitude),
          longitude: String(coordinates.longitude),
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          forecast_days: '16',
          timezone: 'auto',
        });
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('The forecast is temporarily unavailable.');
        const data = await response.json();
        const days = (data.daily?.time || [])
          .map((date, index) => ({
            date,
            code: data.daily.weather_code?.[index],
            high: data.daily.temperature_2m_max?.[index],
            low: data.daily.temperature_2m_min?.[index],
            precipitation: data.daily.precipitation_probability_max?.[index],
          }))
          .filter((day) => day.date >= weekRange.startKey && day.date <= weekRange.endKey);

        if (isCurrent) {
          setForecast(days);
          setPlaceName(coordinates.placeName || locationLabel);
          setStatus(days.length ? 'ready' : 'unavailable');
        }
      } catch (error) {
        if (isCurrent && error.name !== 'AbortError') {
          console.error('Listing weather forecast failed:', error);
          setStatus('unavailable');
        }
      }
    };

    loadForecast();
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [listing, retryCount, weekRange, locationLabel]);

  const askLoopBot = () => {
    const forecastSummary = forecast.map((day) => {
      const weather = getWeather(day.code);
      const rain = day.precipitation == null ? 'rain probability unavailable' : `${day.precipitation}% chance of rain`;
      return `${new Date(`${day.date}T12:00:00`).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}: ${weather.label}, ${Math.round(day.low)}–${Math.round(day.high)}°C, ${rain}`;
    }).join('; ');
    const prompt = `Help me plan a booking for "${listing?.name || 'this listing'}" near ${placeName || locationLabel}. Here is the latest forecast for next week: ${forecastSummary}. Give practical weather-aware planning and packing suggestions. Do not treat this forecast as a guarantee.`;
    window.dispatchEvent(new CustomEvent('open-loopbot', { detail: { initialPrompt: prompt } }));
  };

  return (
    <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-gray-800 dark:bg-gray-900" aria-labelledby="listing-weather-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">
            <SunIcon className="h-5 w-5" />
            Weather for next week
          </div>
          <h2 id="listing-weather-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Plan your booking in {placeName || locationLabel}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {weekRange.start.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}–{new Date(`${weekRange.endKey}T12:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <button type="button" onClick={askLoopBot} disabled={status !== 'ready'} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-200">
          <SparklesIcon className="h-4 w-4" /> Ask LoopOut AI
        </button>
      </div>

      {status === 'loading' ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400"><ArrowPathIcon className="h-4 w-4 animate-spin" /> Loading next week’s forecast…</div>
      ) : status === 'unavailable' ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-gray-800 dark:text-gray-300 sm:flex-row sm:items-center sm:justify-between">
          <span>We couldn’t load the forecast for this listing area.</span>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="inline-flex items-center gap-2 font-semibold text-slate-900 underline underline-offset-4 dark:text-white"><ArrowPathIcon className="h-4 w-4" /> Try again</button>
        </div>
      ) : (
        <div className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 scrollbar-hide [touch-action:pan-x]" role="region" aria-label="Next week daily forecast; scroll sideways to see each day" tabIndex={0}>
          {forecast.map((day) => {
            const weather = getWeather(day.code);
            return (
              <div key={day.date} className="w-[42%] shrink-0 snap-start rounded-2xl bg-slate-50 p-3 sm:w-[23%] lg:w-[13%] dark:bg-gray-800">
                <p className="text-xs font-semibold text-slate-600 dark:text-gray-300">{new Date(`${day.date}T12:00:00`).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric' })}</p>
                <span className="mt-2 block text-2xl" aria-hidden="true">{weather.icon}</span>
                <p className="mt-1 truncate text-xs text-slate-600 dark:text-gray-300">{weather.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{Math.round(day.high)}° <span className="font-normal text-slate-500 dark:text-gray-400">{Math.round(day.low)}°</span></p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-gray-400">{day.precipitation == null ? '—' : `${day.precipitation}% rain`}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-400">
        <MapPinIcon className="h-3.5 w-3.5" /> Forecast for the listing area · <a className="underline underline-offset-2 hover:text-slate-600 dark:hover:text-gray-300" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo</a>
      </div>
    </section>
  );
}
