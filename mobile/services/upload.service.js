/**
 * upload.service.js
 *
 * Uploads files to Firebase Cloud Storage when the user has Firebase Auth,
 * falling back to LoopOut's authenticated upload API for JWT-only accounts.
 */

import { auth, storage } from '../firebase';
import { authenticatedFetch } from '../utils/authenticatedFetch';
import { resolveApiUrl } from '../utils/apiBaseUrl';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

/**
 * Upload one or more File objects to Firebase Storage.
 *
 * @param {File[]} files        - Array of File objects to upload.
 * @param {Function} onProgress - Optional callback receiving 0-100 percent.
 * @returns {Promise<string[]>} - Resolves to an array of permanent cloud download URLs.
 */
const uploadToFirebase = async (files, onProgress) => {
  const uploadPromises = files.map((file, idx) => {
    return new Promise((res, rej) => {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `uploads/${Date.now()}_${idx}_${cleanName}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(pct);
        },
        (err) => rej(err),
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            res(url);
          } catch (e) {
            rej(e);
          }
        }
      );
    });
  });

  return Promise.all(uploadPromises);
};

const uploadToApi = async (files, onProgress) => {
  const uploadedUrls = [];
  const batchSize = 10;

  for (let start = 0; start < files.length; start += batchSize) {
    const batch = files.slice(start, start + batchSize);
    const formData = new FormData();
    batch.forEach((file) => formData.append('files', file));

    const response = await authenticatedFetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false || !Array.isArray(result.urls)) {
      throw new Error(result.message || `Upload failed (${response.status}).`);
    }

    uploadedUrls.push(...result.urls.map((url) => resolveApiUrl(url)));
    onProgress(Math.round((Math.min(start + batch.length, files.length) / files.length) * 100));
  }

  return uploadedUrls;
};

export const uploadFiles = async (files, onProgress = () => {}) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  // Password-based LoopOut accounts use the app's JWT rather than Firebase
  // Auth. Their uploads must go through the authenticated API endpoint because
  // Firebase Storage rules correctly reject unauthenticated writes.
  if (!auth.currentUser) return uploadToApi(files, onProgress);

  try {
    return await uploadToFirebase(files, onProgress);
  } catch (firebaseError) {
    try {
      return await uploadToApi(files, onProgress);
    } catch (apiError) {
      throw new Error(apiError?.message || firebaseError?.message || 'Image upload failed. Please try again.');
    }
  }
};
