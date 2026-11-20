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
  const selectedRef = useRef(isValidPoint(value) ? value : null);
  const onChangeRef = useRef(onChange);

  useEffect(() => { selectedRef.current = isValidPoint(value) ? value : null; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!open || !mapElement.current) return undefined;
    let disposed = false;
    let map;

    import('leaflet').then(({ default: L }) => {
      if (disposed || !mapElement.current) return;
      const initial = selectedRef.current;
      map = L.map(mapElement.current, { zoomControl: true }).setView(
        initial ? [initial.lat, initial.lng] : [-29.0, 25.0],
        initial ? 13 : 5
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      mapRef.current = map;

      const setPin = (latlng) => {
        const coords = { lat: Number(latlng.lat), lng: Number(latlng.lng) };
        if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) return;
        if (markerRef.current) markerRef.current.setLatLng(latlng);
        else markerRef.current = L.marker(latlng, { draggable: true }).addTo(map);
        markerRef.current.off('dragend').on('dragend', (event) => {
          const point = event.target.getLatLng();
          onChangeRef.current({ lat: point.lat, lng: point.lng });
        });
        onChangeRef.current(coords);
        setError('');
      };

      if (initial) {
        markerRef.current = L.marker([initial.lat, initial.lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', (event) => {
          const point = event.target.getLatLng();
          onChangeRef.current({ lat: point.lat, lng: point.lng });
        });
      }
      map.on('click', (event) => setPin(event.latlng));
      window.setTimeout(() => map.invalidateSize(), 100);
    }).catch(() => setError('Could not load the map. Try again.'));

    return () => {
      disposed = true;
      markerRef.current = null;
      mapRef.current = null;
      map?.remove();
    };
  }, [open]);

  const locateDestination = async () => {
    const query = [search.trim(), 'South Africa'].filter(Boolean).join(', ');
    if (!search.trim()) {
      setError('Enter the destination city or area to find it on the map.');
      return;
    }
    setError('Searching for the destination…');
    const point = await geocodeAddress(query);
    if (!point) {
      setError('Could not find that place. Search another name or tap the destination on the map.');
      return;
    }
    if (!mapRef.current) return;
    mapRef.current.setView([point.lat, point.lng], 13);
    const L = window.L || (await import('leaflet')).default;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([point.lat, point.lng], { draggable: true }).addTo(mapRef.current);
    markerRef.current.on('dragend', (event) => {
      const pin = event.target.getLatLng();
      onChangeRef.current({ lat: pin.lat, lng: pin.lng });
    });
    onChangeRef.current(point);
    setError('');
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 p-3 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Destination GPS pin</p>
            {isValidPoint(value) ? <p className="mt-0.5 text-slate-500">{Number(value.lat).toFixed(5)}, {Number(value.lng).toFixed(5)}</p> : <p className="mt-0.5 text-amber-700 dark:text-amber-300">Set a map pin for GPS arrival detection.</p>}
          </div>
          <button type="button" onClick={() => { setSearch(destinationName); setError(''); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800"><MapPin className="h-3.5 w-3.5" />{isValidPoint(value) ? 'Edit pin' : 'Set pin'}</button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label="Set shuttle destination GPS pin">
          <section className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-950">
            <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <div><h3 className="font-semibold text-slate-900 dark:text-white">Pin {destinationName || 'the destination'}</h3><p className="text-xs text-slate-500">Search the town, then move the pin to the actual drop-off area.</p></div>
              <button type="button" aria-label="Close map" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
            </header>
            <div className="flex gap-2 p-3">
              <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); locateDestination(); } }} placeholder="Search a city or area" className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900" />
              <button type="button" onClick={locateDestination} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold dark:border-gray-700"><Search className="h-4 w-4" />Find</button>
            </div>
            <div ref={mapElement} className="h-[48vh] min-h-64 w-full bg-slate-100" />
            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
              <p className={`text-xs ${error ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}`}>{error || 'Tap the map to place a pin, or drag the pin to the destination.'}</p>
          <button type="button" disabled={!isValidPoint(value)} onClick={() => setOpen(false)} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Use this location</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default ShuttleDestinationPicker;
