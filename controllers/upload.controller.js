// Upload controller
// For parsing media uploads using multer to Cloudinary, and returning URL + public_id

const uploadMedia = async (req, res) => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const files = req.files || [req.file];
    
    const mediaArray = files.map((f) => {
      // Determine type based on extension or mimetype
      let fileType = 'document';
      if (f.mimetype.startsWith('image/')) fileType = 'image';
      if (f.mimetype.startsWith('video/')) fileType = 'video';

      // If f.path contains 'cloudinary', it's a cloudinary URL. Otherwise fallback to local uploads URL
      const finalUrl = f.path && f.path.includes('cloudinary') 
        ? f.path 
        : `http://localhost:5000/uploads/${f.filename}`;

      return {
        type: fileType,
        url: finalUrl,
        publicId: f.filename,
        originalName: f.originalname, // Store the original name uploaded by the user
      };
    });

    res.json({ media: mediaArray });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadMedia };
