import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists in client/public/uploads regardless of process.cwd()
const uploadDir = path.resolve(__dirname, '../../client/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname || '') || (file.mimetype ? '.' + file.mimetype.split('/')[1] : '');
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/heic', 'image/heif',
    'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf',
  ]);
  const allowedExtensions = /\.(jpe?g|png|gif|webp|svg|avif|heic|heif|mp4|webm|mov|pdf)$/i;
  
  if (!allowedTypes.has(file.mimetype) && !allowedExtensions.test(file.originalname)) {
    const error = new Error('Only image (JPEG, PNG, GIF, WebP, SVG, AVIF, HEIC), video (MP4, WebM, MOV), and PDF files are allowed.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 10 }
});

