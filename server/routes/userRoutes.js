import express from 'express'
import userControllers from '../controllers/userControllers.js';
import { uploadProfilePic } from '../middlewares/cloudinaryConfig.js';

const userRoutes = ()=>{
    const router = express.Router();
    const controllers = userControllers()

    router.get('/getUserData',controllers.getUserData)
    router.patch('/resetNotifications',controllers.resetNotifications)
    router.get('/getUsersAssign',controllers.getUsersAssign)
    router.get('/getPermissions',controllers.getPermissions)
    router.post('/uploadProfilePic',uploadProfilePic,controllers.uploadProfilePic)
    
    return router
}

export default userRoutes