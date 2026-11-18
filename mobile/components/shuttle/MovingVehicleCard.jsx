import React from 'react';
import { MapPin, Phone, Star, Truck, X } from 'lucide-react';
import MovingVehicleRequests from './MovingVehicleRequests';

const MovingVehicleCard = ({ vehicle, currentUser, onRequest, onClose }) => {
  const isOwner = String(vehicle.driverRef?._id || vehicle.driverRef) === String(currentUser?._id || currentUser?.id);
  return <section className="max-h-[72vh] overflow-y-auto rounded-t-3xl border-t border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:mx-auto sm:max-w-2xl sm:rounded-3xl sm:border">
    <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-gray-300 sm:hidden" />
    <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="rounded-2xl bg-amber-100 p-3 text-amber-800"><Truck /></span><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">Moving help · {vehicle.distanceKm} km away</p><h2 className="text-xl font-extrabold">{vehicle.vehicleType === 'minivan' ? 'Minivan' : 'Truck'}</h2><p className="text-sm text-gray-600 dark:text-gray-300">{vehicle.vehicleDescription}</p></div></div><button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X /></button></div>
    <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><p className="text-xs text-gray-500">Colour</p><p className="font-bold">{vehicle.carColor || 'Not specified'}</p></div><div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800"><p className="text-xs text-gray-500">Rate</p><p className="font-bold">R{vehicle.hourlyRate}/hour{Number(vehicle.callOutFee) > 0 ? ` + R${vehicle.callOutFee} call-out` : ''}</p></div></div>
    {Number(vehicle.ratingCount) > 0 && <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-700"><Star className="h-4 w-4 fill-amber-400 text-amber-500" />{(Number(vehicle.ratingTotal) / Number(vehicle.ratingCount)).toFixed(1)} <span className="text-xs font-normal text-gray-500">({vehicle.ratingCount} customer ratings)</span></p>}
    {vehicle.description && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{vehicle.description}</p>}
    <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" /> Approximate GPS position · updated {new Date(vehicle.currentCoordinates?.updatedAt || vehicle.updatedAt).toLocaleString()}</p>
    {vehicle.plateNumber && <p className="mt-1 text-xs text-gray-500">Vehicle plate: {vehicle.plateNumber}</p>}
    {isOwner && <MovingVehicleRequests vehicleId={vehicle._id} />}
    <div className="mt-4 flex gap-2">{vehicle.driverPhone && <a href={`tel:${vehicle.driverPhone}`} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold"><Phone className="h-4 w-4" />Call</a>}<button disabled={isOwner} onClick={() => onRequest(vehicle)} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-50">{isOwner ? 'Your listing' : 'Request moving help'}</button></div>
  </section>;
};

export default MovingVehicleCard;
