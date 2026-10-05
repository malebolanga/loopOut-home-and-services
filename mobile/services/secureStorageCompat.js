/**
 * secureStorageCompat.js
 *
 * Re-exports real Firebase Storage SDK functions.
 * All pages that previously imported from this compatibility layer now
 * correctly use Firebase Cloud Storage (permanent, cloud-hosted URLs).
 */

export {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString
} from 'firebase/storage';
