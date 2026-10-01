const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

// 6.8: uploads limited to jpg/png/pdf <= 5MB.
const ALLOWED_MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'application/pdf': '.pdf',
};

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Returns a configured Multer instance that writes into uploads/<subfolder>/.
function createUploader(subfolder) {
  const destDir = path.join(UPLOADS_ROOT, subfolder);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(destDir, { recursive: true });
      cb(null, destDir);
    },
    filename: (req, file, cb) => {
      const ext = ALLOWED_MIME_EXT[file.mimetype] || path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!ALLOWED_MIME_EXT[file.mimetype]) {
        return cb(new ApiError(400, 'Only JPG, PNG and PDF files are allowed'));
      }
      cb(null, true);
    },
  });
}

module.exports = createUploader;
