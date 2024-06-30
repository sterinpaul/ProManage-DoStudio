import express from 'express'
import headerControllers from '../controllers/headerControllers.js';

const headerRoutes = ()=>{
    const router = express.Router();
    const controllers = headerControllers()
    
    router.post('/addHeader',controllers.addHeader)
    
    return router
}

export default headerRoutes