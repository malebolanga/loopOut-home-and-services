export const uploadFiles = async (files, onProgress = () => {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/uploads');
    request.withCredentials = true;
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    });
    request.addEventListener('load', () => {
      const payload = request.responseText ? JSON.parse(request.responseText) : {};
      if (request.status >= 200 && request.status < 300) return resolve(payload.urls);
      reject(new Error(payload.message || 'Upload failed.'));
    });
    request.addEventListener('error', () => reject(new Error('Upload failed.')));
    request.send(formData);
  });
};
