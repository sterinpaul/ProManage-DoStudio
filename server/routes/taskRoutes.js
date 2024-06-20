import express from 'express'
import taskControllers from '../controllers/taskControllers.js';

const taskRoutes = ()=>{
    const router = express.Router();
    const controllers = taskControllers()
    
    router.post('/addTask',controllers.addTask)
    router.get('/getSingleProject/:id',controllers.getSingleProject)
    
    return router
}

export default taskRoutes