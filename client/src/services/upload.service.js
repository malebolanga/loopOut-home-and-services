/**
 * upload.service.js
 *
 * Uploads files directly to Firebase Cloud Storage so that images persist
 * permanently across server restarts and deployments.  All pages that call
 * `uploadFiles()` will automatically benefit from cloud storage.
 */

import { storage } from '../firebase';
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
export const uploadFiles = (files, onProgress = () => {}) => {
  return new Promise(async (resolve, reject) => {
    try {
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

      const urls = await Promise.all(uploadPromises);
      resolve(urls);
    } catch (err) {
      reject(err);
    }
  });
};
