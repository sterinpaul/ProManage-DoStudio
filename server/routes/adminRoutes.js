import express from 'express'
import adminControllers from '../controllers/adminControllers.js';


const adminRoutes = ()=>{
    const router = express.Router();
    const controllers = adminControllers()

    router.get('/getAllUsers',controllers.getAllUsers)
    router.get('/getHeaders',controllers.getHeaders)
    router.get('/getPermissions',controllers.getPermissions)
    router.post('/addPermission',controllers.addPermission)
    router.patch('/userStatus',controllers.updateUserStatus)
    router.put('/updatePermissions',controllers.updatePermissions)
    
    return router
}

export default adminRoutes