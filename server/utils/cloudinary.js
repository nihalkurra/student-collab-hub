const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'duesnvaat',
  api_key: '525898569195389',
  api_secret: 'w2Ag4wa6GNvh6_HNy5HA2wP4P00',
});

// Configure storage for different types of uploads
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'student-collab/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'student-collab/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto' }
    ]
  },
});

module.exports = { 
  cloudinary, 
  postImageStorage, 
  avatarStorage 
}; 