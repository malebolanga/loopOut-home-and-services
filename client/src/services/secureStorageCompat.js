// Compatibility layer for legacy Firebase Storage calls.  All media now goes
// through the application's JWT-protected upload API instead of directly to
// Firebase Storage.
export const getStorage = () => ({ secureApi: true });

export const ref = (_storage, fullPath) => ({ fullPath, downloadURL: null });

export const getDownloadURL = async (storageRef) => {
  if (!storageRef.downloadURL) throw new Error('Upload has not completed.');
  return storageRef.downloadURL;
};

const upload = (storageRef, file) => {
  let progressListener;
  let errorListener;
  let completeListener;
  const task = {
    snapshot: { ref: storageRef, bytesTransferred: 0, totalBytes: file.size },
    on: (_event, onProgress, onError, onComplete) => {
      progressListener = onProgress;
      errorListener = onError;
      completeListener = onComplete;
      return () => {};
    },
  };

  queueMicrotask(() => {
    const formData = new FormData();
    formData.append('files', file);
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const request = new XMLHttpRequest();
    request.open('POST', '/api/uploads');
    request.withCredentials = true;
    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    request.upload.addEventListener('progress', (event) => {
      task.snapshot.bytesTransferred = event.loaded;
      task.snapshot.totalBytes = event.total || file.size;
      progressListener?.(task.snapshot);
    });
    request.addEventListener('load', () => {
      try {
        const payload = request.responseText ? JSON.parse(request.responseText) : {};
        if (request.status < 200 || request.status >= 300) {
          throw new Error(payload.message || 'Upload failed.');
        }
        storageRef.downloadURL = payload.urls?.[0];
        if (!storageRef.downloadURL) throw new Error('Upload response did not include a file URL.');
        task.snapshot.bytesTransferred = file.size;
        progressListener?.(task.snapshot);
        completeListener?.();
      } catch (error) {
        errorListener?.(error);
      }
    });
    request.addEventListener('error', () => errorListener?.(new Error('Upload failed.')));
    request.send(formData);
  });

  return task;
};

export const uploadBytesResumable = (storageRef, file) => upload(storageRef, file);

export const uploadString = (storageRef, value, format = 'raw') => {
  const mimeType = format === 'data_url' ? value.match(/^data:([^;,]+)/)?.[1] : 'text/plain';
  const blob = format === 'data_url'
    ? new Blob([atob(value.split(',')[1] || '')], { type: mimeType })
    : new Blob([value], { type: mimeType });
  return upload(storageRef, new File([blob], storageRef.fullPath.split('/').pop() || 'upload'));
};
