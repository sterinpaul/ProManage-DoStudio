import express from 'express'
import priorityControllers from '../controllers/priorityControllers.js';

const priorityRoutes = ()=>{
    const router = express.Router();
    const controllers = priorityControllers()
    
    router.post('/addOption',controllers.addOption)
    router.get('/getAllPriorities',controllers.getOptions)
    
    return router
}

export default priorityRoutes