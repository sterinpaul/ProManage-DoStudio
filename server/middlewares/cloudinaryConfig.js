import multer from 'multer';
import {CloudinaryStorage } from 'multer-storage-cloudinary';
import {v2 as cloudinary} from 'cloudinary';
import configKeys from '../config/configKeys.js';


cloudinary.config({
    cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
    api_key: configKeys.CLOUDINARY_API_KEY,
    api_secret: configKeys.CLOUDINARY_SECRET_KEY
})

const ticketOptions = {
    cloudinary:cloudinary,
    params:{
        folder: 'tickets',
        allowed_formats : ["pdf"],
        public_id: (req,file) => {
            return `ticket-${Date.now()}-${file.originalname.split(".")[0]}`
        }
    }
}

const ticketStorage = new CloudinaryStorage(ticketOptions)
export const uploadTicket = multer({storage:ticketStorage }).single('ticket')
