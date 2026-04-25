const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Safe fallback to disk if Cloudinary credentials are missing or mismatched
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      let folder = 'caseatlas/general';
      let resource_type = 'auto'; // automatically detects image, video, raw

      if (req.originalUrl.includes('case-media')) folder = 'caseatlas/cases';
      else if (req.originalUrl.includes('update-media')) folder = 'caseatlas/updates';
      else if (req.originalUrl.includes('comment-media')) folder = 'caseatlas/comments';

      let format = undefined;
      // For PDFs, Cloudinary serves them inline in the browser if resource_type is 'image' and format is 'pdf'.
      if (file.mimetype === 'application/pdf') {
        resource_type = 'image';
        format = 'pdf';
      } else if (file.mimetype.includes('document') || file.mimetype.includes('msword') || file.mimetype.includes('excel')) {
        resource_type = 'raw';
      }

      // Append timestamp to original name to maintain unique readability
      const originalNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
      const public_id = `${originalNameWithoutExt}-${Date.now()}`;

      return {
        folder: folder,
        resource_type: resource_type,
        public_id: public_id,
        ...(format && { format })
      };
    },
  });
} else {
  // Local fallback
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  });
}

const upload = multer({ storage: storage });

module.exports = upload;
