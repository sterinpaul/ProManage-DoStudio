import multer from 'multer';
import {CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';
import configKeys from '../config/configKeys.js';


cloudinary.config({
    cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
    api_key: configKeys.CLOUDINARY_API_KEY,
    api_secret: configKeys.CLOUDINARY_SECRET_KEY
})

const chatFileOptions = {
    cloudinary,
    params:(req,file)=>{
        const { roomId, type } = req.body;
        return {
            folder: `chats/${roomId}/${type}`,
            resource_type: 'auto',
            public_id: `chat-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const chatFileUploadStorage = new CloudinaryStorage(chatFileOptions)
export const uploadChatFile = multer({storage:chatFileUploadStorage }).single('file')


// allowed_formats : ["jpg","jpeg","png","gif","bmp","tiff","tif","svg","webp","heic","txt"],
// resource_type: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'raw',
// transformation: [{ width: 500, height: 500, crop: 'limit' },{ quality: '60' }],