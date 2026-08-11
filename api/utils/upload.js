import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), 'client', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'application/pdf',
  ]);
  const allowedExtensions = /\.(jpe?g|png|gif|webp|mp4|webm|pdf)$/i;
  if (!allowedTypes.has(file.mimetype) || !allowedExtensions.test(file.originalname)) {
    return cb(new Error('Only JPEG, PNG, GIF, WebP, MP4, WebM, and PDF files are allowed.'), false);
  }
  cb(null, true);
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }
});
