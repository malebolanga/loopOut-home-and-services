import React, { useState } from 'react';
import { ArrowRight, CalendarDays, Loader2, MapPin, Route, X } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import ShuttleDestinationPicker from './ShuttleDestinationPicker';

const PROVINCES = ['Gauteng', 'Limpopo', 'Mpumalanga', 'KwaZulu-Natal', 'Western Cape', 'North West', 'Free State', 'Eastern Cape', 'Northern Cape'];

const localDateInputValue = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const offsetTomorrow = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000);
  return offsetTomorrow.toISOString().slice(0, 10);
};

const DriverAddRouteModal = ({ shuttle, onClose, onSuccess }) => {
  const [serviceType, setServiceType] = useState(shuttle.serviceType || 'interprovincial');
  const [departureProvince, setDepartureProvince] = useState(shuttle.departureProvince || '');
  const [destinationProvince, setDestinationProvince] = useState(shuttle.destinationProvince || '');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [pickupStation, setPickupStation] = useState('');
  const [dropoffStation, setDropoffStation] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [originCoordinates, setOriginCoordinates] = useState(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [leavesWhenFull, setLeavesWhenFull] = useState(shuttle.leavesWhenFull !== false);
  const [isHouseToHouse, setIsHouseToHouse] = useState(true);
  const [pricePerSeat, setPricePerSeat] = useState(shuttle.pricePerSeat || '');
  const [extraBagPrice, setExtraBagPrice] = useState(shuttle.extraBagPrice || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitRoute = async (event) => {
    event.preventDefault();
    setError('');
    if (!originCity.trim() || !destinationCity.trim()) {
      setError('Enter the starting city and destination city for this route.');
      return;
    }
    if (!departureProvince || (serviceType !== 'local' && !destinationProvince)) {
      setError('Choose the province or provinces for this route.');
      return;
    }
    if (!departureTime.trim()) {
      setError('Enter the planned departure time. The shuttle can also leave earlier if all seats are booked.');
      return;
    }
    if (!originCoordinates || !destinationCoordinates) {
      setError('Set map pins for the route start and destination so GPS can detect arrival.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(resolveApiUrl(`/api/shuttles/add-route/${shuttle._id}`), {
        serviceType,
        departureProvince,
        destinationProvince: serviceType === 'local' ? departureProvince : destinationProvince,
        originCity: originCity.trim(),
        destinationCity: destinationCity.trim(),
        originCoordinates,
        destinationCoordinates,
        pickupStation: pickupStation.trim() || `House-to-house near ${originCity.trim()}`,
        dropoffStation: dropoffStation.trim() || `House-to-house near ${destinationCity.trim()}`,
        isHouseToHouse,
        dropoffType: isHouseToHouse ? 'house_to_house' : 'station',
        leavesWhenFull,
        departureRule: leavesWhenFull ? 'when_full' : 'scheduled',
        departureDate,
        departureTime: departureTime.trim(),
        pricePerSeat: Number(pricePerSeat),
        extraBagPrice: Number(extraBagPrice) || 0,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (!response.data?.success) throw new Error(response.data?.message || 'Could not add the route.');
      onSuccess?.(response.data.shuttle);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not add the route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
      <section className="my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/80 sm:p-5">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200"><Route className="h-5 w-5" /></span>
            <div><p className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">Existing vehicle · {shuttle.plateNumber}</p><h2 className="mt-0.5 text-lg font-black text-gray-950 dark:text-white">Add another route</h2><p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Your car, driver profile, seats, and payment details will be reused.</p></div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close add route" className="rounded-full p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={submitRoute} className="max-h-[75vh] space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{shuttle.carType} · {shuttle.carColor}</p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">Registration {shuttle.plateNumber} · {shuttle.totalSeats} seats · driver verification already approved</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Route type<select value={serviceType} onChange={(event) => setServiceType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="interprovincial">Interprovincial</option><option value="local">Local</option></select></label>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Departure province<select required value={departureProvince} onChange={(event) => setDepartureProvince(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="">Choose province</option>{PROVINCES.map((province) => <option key={province}>{province}</option>)}</select></label>
            {serviceType !== 'local' && <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 sm:col-span-2">Destination province<select required value={destinationProvince} onChange={(event) => setDestinationProvince(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="">Choose province</option>{PROVINCES.map((province) => <option key={province}>{province}</option>)}</select></label>}
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">From city<input required maxLength={100} value={originCity} onChange={(event) => { setOriginCity(event.target.value); setOriginCoordinates(null); }} placeholder="e.g. Polokwane" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">To city<input required maxLength={100} value={destinationCity} onChange={(event) => { setDestinationCity(event.target.value); setDestinationCoordinates(null); }} placeholder="e.g. Bloemfontein" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Pickup coverage<input maxLength={160} value={pickupStation} onChange={(event) => setPickupStation(event.target.value)} placeholder={`House-to-house near ${originCity || 'starting city'}`} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /><span className="mt-1 block text-[11px] font-normal text-gray-500">Default: homes near the route’s starting city. Adjust the covered suburbs if needed.</span></label>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Drop-off coverage<input maxLength={160} value={dropoffStation} onChange={(event) => setDropoffStation(event.target.value)} placeholder={`House-to-house near ${destinationCity || 'destination city'}`} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /><span className="mt-1 block text-[11px] font-normal text-gray-500">Default: homes near the destination city. Customers enter their exact address.</span></label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ShuttleDestinationPicker value={originCoordinates} onChange={setOriginCoordinates} destinationName={originCity || 'route starting city'} />
            <ShuttleDestinationPicker value={destinationCoordinates} onChange={setDestinationCoordinates} destinationName={destinationCity || 'destination city'} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Departure date</span><input required type="date" min={localDateInputValue()} value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /><span className="mt-1 block text-[11px] font-normal text-gray-500">Choose tomorrow or a later date.</span></label>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Fare per seat (R)<input required min="1" step="0.01" type="number" value={pricePerSeat} onChange={(event) => setPricePerSeat(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200"><input type="checkbox" checked={leavesWhenFull} onChange={(event) => setLeavesWhenFull(event.target.checked)} className="h-4 w-4 accent-teal-700" />Can leave earlier when all seats are booked</label>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">Planned departure time<input required type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">Extra bag fee (R)<input min="0" step="0.01" type="number" value={extraBagPrice} onChange={(event) => setExtraBagPrice(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900" /></label>
            <label className="self-end rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-100"><span className="flex items-center gap-2 font-bold"><input type="checkbox" checked={isHouseToHouse} onChange={(event) => setIsHouseToHouse(event.target.checked)} className="h-4 w-4 accent-teal-700" /><MapPin className="h-4 w-4" />House-to-house (on by default)</span><span className="mt-1 block">Pickup and drop-off near each route end. The driver confirms whether exact addresses are in the covered area.</span></label>
          </div>

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
          <footer className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800"><button type="button" onClick={onClose} disabled={loading} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button><button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{loading ? 'Adding route…' : 'Add this route'}</button></footer>
        </form>
      </section>
    </div>
  );
};

export default DriverAddRouteModal;
