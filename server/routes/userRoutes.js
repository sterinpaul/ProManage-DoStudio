import express from 'express'
import userControllers from '../controllers/userControllers.js';
// import { uploadTicket } from '../middlewares/cloudinaryConfig.js';

const userRoutes = ()=>{
    const router = express.Router();
    const controllers = userControllers()

    router.get('/getUserData',controllers.getUserData)
    router.get('/getUsersAssign',controllers.getUsersAssign)
    
    return router
}

export default userRoutes