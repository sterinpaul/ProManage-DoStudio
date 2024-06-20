import express from 'express'
import adminControllers from '../controllers/adminControllers.js';
// import { uploadTicket } from '../middlewares/cloudinaryConfig.js';

const adminRoutes = ()=>{
    const router = express.Router();
    const controllers = adminControllers()

    router.get('/getAllUsers',controllers.getAllUsers)
    router.patch('/userStatus',controllers.updateUserStatus)
    router.put('/updatePermissions',controllers.updatePermissions)
    
    return router
}

export default adminRoutes