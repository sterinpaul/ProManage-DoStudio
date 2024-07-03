import express from 'express'
import statusControllers from '../controllers/statusControllers.js';

const statusRoutes = ()=>{
    const router = express.Router();
    const controllers = statusControllers()
    
    router.post('/addOption',controllers.addOption)
    router.get('/getAllStatus',controllers.getOptions)
    
    return router
}

export default statusRoutes