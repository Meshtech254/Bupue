const express = require('express');
const router = express.Router();
const { upload, handleUploadError, cloudinary } = require('../middleware/upload');
const auth = require('../middleware/auth');

// Upload single file
router.post('/single', auth, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        url: req.file.path,
        publicId: req.file.filename,
        originalName: req.file.originalname,
        format: req.file.format,
        size: req.file.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Upload multiple files (max 5)
router.post('/multiple', auth, upload.array('files', 5), handleUploadError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      format: file.format,
      size: file.bytes
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

// Get file details
router.get('/details/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Get resource details from Cloudinary
    const result = await cloudinary.api.resource(publicId);
    
    res.json({
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Get file details error:', error);
    if (error.http_code === 404) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: 'Failed to get file details' });
  }
});

module.exports = router;
