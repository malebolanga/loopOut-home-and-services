import React, { useEffect, useState } from 'react';
import { Truck, X, MapPin, LoaderCircle, Upload, CheckCircle2, UserRound, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { resolveApiUrl } from '../../utils/apiBaseUrl';
import { uploadFiles } from '../../services/upload.service';
import { geocodeAddress, reverseGeocodeArea } from '../../utils/geocoding';

const MovingVehicleUploadModal = ({ onClose, onSuccess, currentUser }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ vehicleType: 'truck', vehicleDescription: '', carColor: '', driverPhone: currentUser?.phone || '', plateNumber: '', hourlyRate: '', callOutFee: '0', description: '' });
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [vehicleLicenceDocumentUrl, setVehicleLicenceDocumentUrl] = useState('');
  const [vehicleImageUrl, setVehicleImageUrl] = useState('');
  const [driverPhotoUrl, setDriverPhotoUrl] = useState('');
  const [existingShuttleDriverPhoto, setExistingShuttleDriverPhoto] = useState('');
  const [checkingShuttlePhoto, setCheckingShuttlePhoto] = useState(true);
  const [uploadingKey, setUploadingKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    axios.get(resolveApiUrl('/api/shuttles/my-shuttles'), {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    }).then(({ data }) => {
      if (!active) return;
      const existingPhoto = (data.shuttles || []).find((shuttle) => typeof shuttle.driverAvatar === 'string' && shuttle.driverAvatar.trim())?.driverAvatar || '';
      setExistingShuttleDriverPhoto(existingPhoto);
    }).catch(() => {
      if (active) setExistingShuttleDriverPhoto('');
    }).finally(() => {
      if (active) setCheckingShuttlePhoto(false);
    });
    return () => { active = false; };
  }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) return setError('This device does not provide GPS location.');
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (!Number.isFinite(coords.accuracy) || coords.accuracy > 20) {
        setLocation(null);
        setError(`GPS accuracy is about ${Math.round(coords.accuracy || 0)} m. Move outside and retry for a clearer fix (5 m is ideal; maximum accepted is 20 m), or enter the vehicle address below.`);
        setBusy(false);
        return;
      }
      const address = await reverseGeocodeArea(coords.latitude, coords.longitude);
      setLocation({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy, address, locationSource: 'gps' });
      setLocationAddress(address || '');
      setBusy(false);
    }, () => { setError('Allow phone GPS or enter the truck’s parked address to set its map location.'); setBusy(false); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  };

  const useAddressLocation = async () => {
    const address = locationAddress.trim();
    if (!address) return setError('Enter the town, suburb, or street where the truck is parked.');
    setBusy(true); setError('');
    try {
      const point = await geocodeAddress(`${address}, South Africa`);
      if (!point) throw new Error('We could not find that address. Add the suburb or town and try again.');
      setLocation({ ...point, accuracy: null, address, locationSource: 'address' });
    } catch (locationError) {
      setError(locationError.message || 'Could not find that address.');
    } finally { setBusy(false); }
  };

  const uploadPhoto = async (file, kind) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file for the driver or vehicle photo.'); return; }
    setUploadingKey(kind); setError('');
    try {
      const [url] = await uploadFiles([file]);
      if (!url) throw new Error('The upload did not return a photo link.');
      if (kind === 'driver') setDriverPhotoUrl(url);
      else setVehicleImageUrl(url);
    } catch (uploadError) { setError(uploadError.message || 'Could not upload the photo.'); }
    finally { setUploadingKey(''); }
  };

  const uploadVehicleDocument = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) { setError('Choose a PDF vehicle licence or registration document.'); return; }
    setUploadingKey('document'); setError('');
    try {
      const [url] = await uploadFiles([file]);
      if (!url) throw new Error('The upload did not return a document link.');
      setVehicleLicenceDocumentUrl(url);
    } catch (uploadError) { setError(uploadError.message || 'Could not upload the vehicle document.'); }
    finally { setUploadingKey(''); }
  };

  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!location) return setError('Capture a precise GPS location or set the truck location by address before submitting.');
    if (!vehicleImageUrl) return setError('Upload a clear photo of the truck or minivan.');
    if (!existingShuttleDriverPhoto && !driverPhotoUrl) return setError('Upload a clear photo of the driver.');
    if (!vehicleLicenceDocumentUrl) return setError('Upload the truck or minivan licence disc / registration document PDF.');
    setBusy(true);
    try {
      const response = await axios.post(resolveApiUrl('/api/shuttles/moving/vehicles'), {
        ...form,
        driverPhotoUrl: existingShuttleDriverPhoto || driverPhotoUrl,
        vehicleImageUrl,
        vehicleLicenceDocumentUrl,
        hourlyRate: Number(form.hourlyRate),
        callOutFee: Number(form.callOutFee),
        currentCoordinates: location,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      onSuccess?.(response.data.vehicle); onClose();
    } catch (err) {
      if (err.response?.status === 404) {
        setError('The moving vehicle service is currently deploying on the backend server. Please try again shortly.');
      } else {
        setError(err.response?.data?.message || 'Could not submit your moving vehicle.');
      }
    }
    finally { setBusy(false); }
  };

  const field = (key, label, placeholder, type = 'text') => <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{label}<input required type={type} min={type === 'number' ? (key === 'hourlyRate' ? '1' : '0') : undefined} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" /></label>;

  const photoUpload = (kind, label, url, setUrl) => <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
    <div className="flex items-center gap-2 text-sm font-semibold">{kind === 'driver' ? <UserRound className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}{label}</div>
    {url && <img src={url} alt={label} className="mt-2 h-32 w-full rounded-lg bg-gray-100 object-cover dark:bg-gray-800" />}
    <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-gray-900">{uploadingKey === kind ? <LoaderCircle className="h-4 w-4 animate-spin" /> : url ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}{uploadingKey === kind ? 'Uploading…' : url ? 'Replace photo' : 'Upload photo'}<input type="file" accept="image/*" disabled={Boolean(uploadingKey) || busy} className="sr-only" onChange={(event) => { uploadPhoto(event.target.files?.[0], kind); event.target.value = ''; }} /></label>
  </div>;

  return <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <form onSubmit={submit} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-gray-900 sm:rounded-3xl">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-800"><Truck /></span><div><h2 className="text-lg font-bold">Add truck or minivan</h2><p className="text-xs text-gray-500">Step {step} of 2 · submitted for vehicle approval</p></div></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><X /></button></div>
      <div className="flex gap-1"><div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-teal-600' : 'bg-gray-200'}`} /><div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`} /></div>

      {step === 1 ? <div className="space-y-4">
        <label className="block text-sm font-semibold">Vehicle type<select value={form.vehicleType} onChange={(event) => setForm({ ...form, vehicleType: event.target.value })} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-950"><option value="truck">Truck</option><option value="minivan">Minivan</option></select></label>
        {field('vehicleDescription', 'Truck or minivan name / make', 'e.g. Nissan Cabstar mini truck')}
        <div className="grid grid-cols-2 gap-3">{field('carColor', 'Vehicle colour', 'e.g. White')}{field('plateNumber', 'Registration plate', 'e.g. JHB 123 GP')}</div>
        <div className="grid grid-cols-2 gap-3">{field('hourlyRate', 'Hourly rate (R)', 'e.g. 350', 'number')}{field('callOutFee', 'Call-out fee (R)', '0', 'number')}</div>
        <label className="block text-sm font-semibold">Moving service details<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={800} placeholder="Loading help, unloading, and items you can carry" className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" /></label>
        <button type="button" onClick={(event) => { if (event.currentTarget.form.reportValidity()) setStep(2); }} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Next: driver, photos & documents</button>
      </div> : <div className="space-y-4">
        {field('driverPhone', 'Driver contact phone', 'Mobile number', 'tel')}
        <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-gray-800"><p className="font-semibold">Assigned driver</p><p className="mt-1 text-gray-600 dark:text-gray-300">{currentUser?.name || currentUser?.username || 'Your approved driver account'}</p><p className="mt-1 text-xs text-gray-500">The approved driver account is reused; only this vehicle needs separate admin approval.</p></div>
        {checkingShuttlePhoto ? <p className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800">Checking whether your shuttle driver photo can be reused…</p>
          : existingShuttleDriverPhoto ? <div className="rounded-xl border border-emerald-200 p-3 dark:border-emerald-900"><p className="text-sm font-semibold">Driver photo reused from your shuttle</p><img src={existingShuttleDriverPhoto} alt="Existing shuttle driver" className="mt-2 h-28 w-28 rounded-xl object-cover" /></div>
            : photoUpload('driver', 'Driver photo', driverPhotoUrl, setDriverPhotoUrl)}
        {photoUpload('vehicle', 'Truck or minivan photo', vehicleImageUrl, setVehicleImageUrl)}
        <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"><p className="text-sm font-semibold">Vehicle licence disc / registration document (PDF)</p><p className="mt-1 text-xs text-gray-500">An administrator checks the document against the registration plate.</p><label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-gray-900">{uploadingKey === 'document' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : vehicleLicenceDocumentUrl ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}{uploadingKey === 'document' ? 'Uploading…' : vehicleLicenceDocumentUrl ? 'Replace PDF' : 'Upload PDF'}<input type="file" accept="application/pdf,.pdf" disabled={Boolean(uploadingKey) || busy} className="sr-only" onChange={(event) => { uploadVehicleDocument(event.target.files?.[0]); event.target.value = ''; }} /></label>{vehicleLicenceDocumentUrl && <p className="mt-2 text-xs text-emerald-700">PDF uploaded</p>}</div>
        <div className="space-y-2 rounded-xl border border-teal-200 p-3 dark:border-teal-900">
          <p className="text-sm font-semibold">Where is the truck parked?</p>
          <button type="button" disabled={busy || Boolean(uploadingKey)} onClick={captureLocation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-50 px-3 py-3 text-sm font-bold text-teal-800 dark:bg-teal-950/50 dark:text-teal-200">{busy && !location ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}{location?.locationSource === 'gps' ? 'Refresh phone GPS location' : 'Use my phone GPS'}</button>
          <p className="text-xs text-gray-500">For GPS, 5 m accuracy is ideal; the app accepts a fix up to 20 m. If GPS is unavailable, enter the parked location below.</p>
          <label className="block text-xs font-semibold">Enter a street, suburb, or town<input value={locationAddress} onChange={(event) => { setLocationAddress(event.target.value); if (location?.locationSource === 'address') setLocation(null); }} placeholder="e.g. Market Street, Polokwane" className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" /></label>
          <button type="button" disabled={busy || Boolean(uploadingKey) || !locationAddress.trim()} onClick={useAddressLocation} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50 dark:border-gray-700">{busy && location?.locationSource !== 'gps' ? 'Finding address…' : 'Use this address'}</button>
          {location && <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Map location: {location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`} · {location.locationSource === 'gps' ? `GPS accuracy about ${Math.round(location.accuracy)} m` : 'address pin'}</p>}
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2"><button type="button" disabled={busy || Boolean(uploadingKey)} onClick={() => setStep(1)} className="rounded-xl border px-4 py-3 text-sm font-semibold dark:border-gray-700">Back</button><button disabled={busy || Boolean(uploadingKey) || checkingShuttlePhoto} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Submitting…' : 'Submit for admin approval'}</button></div>
        <p className="text-xs text-gray-500">Your listing remains off the map until an administrator approves the vehicle details, photo, plate, and document. No payment is collected here.</p>
      </div>}
      {step === 1 && error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  </div>;
};

export default MovingVehicleUploadModal;
