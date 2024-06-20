import express from 'express'
import chatControllers from '../controllers/chatControllers.js';
// import { uploadTicket } from '../middlewares/cloudinaryConfig.js';

const chatRoutes = ()=>{
    const router = express.Router();
    const controllers = chatControllers()

    router.get('/getChatMessages/:roomId',controllers.getChatMessages)
    router.post('/sendMessage',controllers.sendMessage)
    
    return router
}

export default chatRoutes