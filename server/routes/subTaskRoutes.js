import subTaskControllers from '../controllers/subTaskControllers.js';
import express from 'express'
// import multer from 'multer'
// const upload = multer()

const subTaskRoutes = ()=>{
    const router = express.Router();
    const controllers = subTaskControllers()

    router.post('/addSubTask',controllers.addSubTask)
    router.patch('/updateName',controllers.updateSubTaskName)
    router.patch('/updateNote',controllers.updateSubTaskNote)
    router.patch('/updateStatus',controllers.updateSubTaskStatus)
    router.patch('/updatePriority',controllers.updateSubTaskPriority)
    router.patch('/updateDueDate',controllers.updateDueDate)
    router.patch('/assignSubTask',controllers.assignSubTask)
    router.patch('/removeSubTask',controllers.removeSubTsk)
    
    return router
}

export default subTaskRoutes