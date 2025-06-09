// middleware/UploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Membuat folder uploads jika belum ada
const uploadDir = 'uploads/laporan';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format nama file: laporan_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `laporan_${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// Filter untuk tipe file yang diizinkan
const fileFilter = (req, file, cb) => {
  // Tipe file yang diizinkan
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan (jpeg, jpg, png, gif, webp)'));
  }
};

// Konfigurasi multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Middleware untuk handle error upload
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Terlalu banyak file. Maksimal 1 file'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Error saat upload file',
      error: error.message
    });
  }
  
  if (error.message.includes('Hanya file gambar')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function untuk menghapus file
export const deleteFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  }
  return false;
};

// Helper function untuk mendapatkan URL file
export const getFileUrl = (filename) => {
  if (filename) {
    return `/uploads/laporan/${filename}`;
  }
  return null;
};