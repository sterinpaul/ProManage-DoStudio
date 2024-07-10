import express from 'express'
import taskControllers from '../controllers/taskControllers.js';

const taskRoutes = ()=>{
    const router = express.Router();
    const controllers = taskControllers()
    
    router.post('/addTask',controllers.addTask)
    router.get('/getSingleProject/:projectId',controllers.getSingleProject)
    router.delete('/removeTask/:taskId',controllers.removeTask)
    router.patch('/dndTasks',controllers.dndTaskUpdate)
    router.patch('/dndHeaders',controllers.dndHeaderUpdate)
    
    return router
}

export default taskRoutes