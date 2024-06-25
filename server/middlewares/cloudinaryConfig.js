import multer from 'multer';
import {CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';
import configKeys from '../config/configKeys.js';


cloudinary.config({
    cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
    api_key: configKeys.CLOUDINARY_API_KEY,
    api_secret: configKeys.CLOUDINARY_SECRET_KEY
})

const chatImageOptions = {
    cloudinary,
    params:{
        folder: 'chatImages',
        allowed_formats : ["jpg","jpeg","png","gif"],
        public_id: (req,file) => {
            return `chat-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const chatImageStorage = new CloudinaryStorage(chatImageOptions)
export const uploadChatImage = multer({storage:chatImageStorage }).single('image')
