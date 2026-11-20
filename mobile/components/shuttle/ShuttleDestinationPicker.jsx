import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { geocodeAddress } from '../../utils/geocoding';

const isValidPoint = (point) => point && point.lat !== null && point.lat !== undefined && point.lat !== ''
  && point.lng !== null && point.lng !== undefined && point.lng !== ''
  && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));

const ShuttleDestinationPicker = ({ value, onChange, destinationName = '' }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(destinationName);
  const [error, setError] = useState('');
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const valueRef = useRef(isValidPoint(value) ? value : null);
  const changeRef = useRef(onChange);

  useEffect(() => { valueRef.current = isValidPoint(value) ? value : null; }, [value]);
  useEffect(() => { changeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!open || !mapElement.current) return undefined;
    let disposed = false;
    let map = null;

    const createMap = () => {
      if (disposed || !mapElement.current || !window.L) return;
      const L = window.L;
      const point = valueRef.current;
      map = L.map(mapElement.current, { zoomControl: true }).setView(point ? [point.lat, point.lng] : [-29, 25], point ? 13 : 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;

      const setPin = (latlng) => {
        const coords = { lat: Number(latlng.lat), lng: Number(latlng.lng) };
        if (markerRef.current) markerRef.current.setLatLng(latlng);
        else markerRef.current = L.marker(latlng, { draggable: true }).addTo(map);
        markerRef.current.off('dragend').on('dragend', (event) => {
          const moved = event.target.getLatLng();
          changeRef.current({ lat: moved.lat, lng: moved.lng });
        });
        changeRef.current(coords);
        setError('');
      };

      if (point) {
        markerRef.current = L.marker([point.lat, point.lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', (event) => {
          const moved = event.target.getLatLng();
          changeRef.current({ lat: moved.lat, lng: moved.lng });
        });
      }
      map.on('click', (event) => setPin(event.latlng));
      window.setTimeout(() => map?.invalidateSize(), 100);
    };

    if (window.L) createMap();
    else {
      if (!document.querySelector('link[data-shuttle-picker-leaflet]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.dataset.shuttlePickerLeaflet = 'true';
        document.head.appendChild(link);
      }
      const existingScript = document.querySelector('script[data-shuttle-picker-leaflet]');
      if (existingScript) existingScript.addEventListener('load', createMap, { once: true });
      else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.dataset.shuttlePickerLeaflet = 'true';
        script.onload = createMap;
        script.onerror = () => setError('Could not load the map. Try again.');
        document.head.appendChild(script);
      }
    }

    return () => {
      disposed = true;
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, [open]);

  const locate = async () => {
    if (!search.trim()) { setError('Enter a city or area to find it on the map.'); return; }
    setError('Searching for the destination…');
    const point = await geocodeAddress(`${search.trim()}, South Africa`);
    if (!point) { setError('Could not find the place. Try another name or tap the map.'); return; }
    const L = window.L;
    if (!L || !mapRef.current) { setError('Map is still loading. Please try again.'); return; }
    mapRef.current.setView([point.lat, point.lng], 13);
    markerRef.current?.remove();
    markerRef.current = L.marker([point.lat, point.lng], { draggable: true }).addTo(mapRef.current);
    markerRef.current.on('dragend', (event) => {
      const moved = event.target.getLatLng();
      changeRef.current({ lat: moved.lat, lng: moved.lng });
    });
    changeRef.current(point);
    setError('');
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{destinationName.includes('starting') ? 'Origin GPS pin' : 'Destination GPS pin'}</p>
            {isValidPoint(value) ? <p className="mt-0.5 text-slate-500">{Number(value.lat).toFixed(5)}, {Number(value.lng).toFixed(5)}</p> : <p className="mt-0.5 text-amber-700 dark:text-amber-300">Set a map pin for GPS tracking.</p>}
          </div>
          <button type="button" onClick={() => { setSearch(destinationName); setError(''); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white"><MapPin className="h-3.5 w-3.5" />{isValidPoint(value) ? 'Edit pin' : 'Set pin'}</button>
        </div>
      </div>
      {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Set shuttle route GPS pin">
        <section className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-950">
          <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800"><div><h3 className="font-semibold text-slate-900 dark:text-white">Pin {destinationName || 'the route location'}</h3><p className="text-xs text-slate-500">Search, then move the pin to the actual pickup or drop-off area.</p></div><button type="button" aria-label="Close map" onClick={() => setOpen(false)} className="rounded-full p-2"><X className="h-5 w-5" /></button></header>
          <div className="flex gap-2 p-3"><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); locate(); } }} placeholder="Search a city or area" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" /><button type="button" onClick={locate} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700"><Search className="h-4 w-4" />Find</button></div>
          <div ref={mapElement} className="h-[48vh] min-h-64 w-full bg-slate-100" />
          <div className="flex flex-wrap items-center justify-between gap-2 p-3"><p className={`text-xs ${error ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}`}>{error || 'Tap the map to place a pin or drag it to the exact location.'}</p><button type="button" disabled={!isValidPoint(value)} onClick={() => setOpen(false)} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Use this location</button></div>
        </section>
      </div>}
    </>
  );
};

export default ShuttleDestinationPicker;
