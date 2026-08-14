export const uploadFiles = async (files, onProgress = () => {}) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const token = localStorage.getItem('access_token') || localStorage.getItem('token');

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/uploads');
    request.withCredentials = true;
    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    });
    request.addEventListener('load', () => {
      let payload = {};
      try {
        payload = request.responseText ? JSON.parse(request.responseText) : {};
      } catch (e) {
        payload = { message: request.responseText };
      }
      if (request.status >= 200 && request.status < 300) return resolve(payload.urls);
      reject(new Error(payload.message || `Upload failed with status ${request.status}`));
    });
    request.addEventListener('error', () => reject(new Error('Upload network error.')));
    request.send(formData);
  });
};

