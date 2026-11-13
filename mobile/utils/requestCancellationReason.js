export function requestCancellationReason() {
  const reason = window.prompt('Why are you cancelling this booking? Please enter a reason:');
  if (reason === null) return null;

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    window.alert('Please enter a reason to cancel this booking.');
    return null;
  }

  return trimmedReason.slice(0, 500);
}
