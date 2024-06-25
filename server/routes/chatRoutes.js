import express from 'express'
import chatControllers from '../controllers/chatControllers.js';
import { uploadChatImage } from '../middlewares/cloudinaryConfig.js';

const chatRoutes = ()=>{
    const router = express.Router();
    const controllers = chatControllers()

    router.get('/getChatMessages/:roomId',controllers.getChatMessages)
    router.post('/sendMessage',controllers.sendMessage)
    router.post('/sendImage',uploadChatImage,controllers.sendImage)
    router.patch('/updateUnreadChat',controllers.updateUnreadChat)
    
    return router
}

export default chatRoutes