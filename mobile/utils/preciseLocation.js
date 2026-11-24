const TARGET_ACCURACY_METERS = 30;
const ACCEPTABLE_FALLBACK_ACCURACY_METERS = 500;
const LOCATION_TIMEOUT_MS = 15000;
const COARSE_LOCATION_THRESHOLD_METERS = 10000;

const formatAccuracy = (accuracy) => accuracy >= 1000
  ? `±${(accuracy / 1000).toFixed(1)} km`
  : `±${accuracy.toFixed(1)} m`;

export const capturePrecisePhoneLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('This device does not provide GPS. Enter the vehicle address instead.'));
    return;
  }

  let watchId = null;
  let timeoutId = null;
  let settled = false;
  let bestAccuracy = Infinity;
  let bestPosition = null;

  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    if (timeoutId !== null) window.clearTimeout(timeoutId);
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    callback(value);
  };

  const handleTimeoutOrStop = () => {
    if (bestPosition && bestAccuracy <= ACCEPTABLE_FALLBACK_ACCURACY_METERS) {
      finish(resolve, bestPosition);
      return;
    }

    const message = Number.isFinite(bestAccuracy) && bestAccuracy >= COARSE_LOCATION_THRESHOLD_METERS
      ? `Your device returned only an approximate location (${formatAccuracy(bestAccuracy)}). Turn on device Location and allow precise location for LoopOut, then retry outdoors or enter the truck's street address instead.`
      : Number.isFinite(bestAccuracy)
        ? `Phone GPS only reached ${formatAccuracy(bestAccuracy)} accuracy. Move outdoors for a clearer GPS signal, or enter the street address.`
      : 'Phone GPS could not get a location fix. Move outdoors and retry, or use the address option.';
    const error = new Error(message);
    error.accuracy = Number.isFinite(bestAccuracy) ? bestAccuracy : null;
    finish(reject, error);
  };

  timeoutId = window.setTimeout(handleTimeoutOrStop, LOCATION_TIMEOUT_MS);
  watchId = navigator.geolocation.watchPosition((position) => {
    const accuracy = Number(position.coords.accuracy);
    if (Number.isFinite(accuracy)) {
      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;
      }
      if (accuracy <= TARGET_ACCURACY_METERS) {
        finish(resolve, position);
      }
    }
  }, (error) => {
    if (bestPosition && bestAccuracy <= ACCEPTABLE_FALLBACK_ACCURACY_METERS) {
      finish(resolve, bestPosition);
    } else if (Number.isFinite(bestAccuracy)) {
      handleTimeoutOrStop();
    } else {
      finish(reject, new Error(error.code === 1 ? 'Allow phone GPS access, or use the address option.' : 'Phone GPS is unavailable. Move outdoors and retry, or use the address option.'));
    }
  }, { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 0 });
});
