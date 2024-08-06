import express from 'express'
import adminControllers from '../controllers/adminControllers.js';
import permissionMiddleware from '../middlewares/permissionMiddleware.js';


const adminRoutes = ()=>{
    const router = express.Router();
    const controllers = adminControllers()

    router.get('/getAllUsers',permissionMiddleware(),controllers.getAllUsers)
    router.get('/getHeaders',permissionMiddleware(),controllers.getHeaders)
    router.get('/getPermissions',permissionMiddleware(),controllers.getPermissions)
    router.post('/addPermission',permissionMiddleware(),controllers.addPermission)
    router.patch('/userStatus',permissionMiddleware(),controllers.updateUserStatus)
    router.put('/updatePermissions',permissionMiddleware(),controllers.updatePermissions)
    router.patch('/updateProjectName',permissionMiddleware(),controllers.updateProjectName)
    router.patch('/removeProject',permissionMiddleware(),controllers.removeProject)
    router.put('/cloneProject',permissionMiddleware(),controllers.cloneProject)
    
    return router
}

export default adminRoutes