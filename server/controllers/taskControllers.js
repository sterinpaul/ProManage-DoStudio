import Joi from "joi"
import taskHelpers from "../helpers/taskHelpers.js"
import userHelpers from "../helpers/userHelpers.js"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"
import headerHelpers from "../helpers/headerHelpers.js"
import notificationHelpers from "../helpers/notificationHelpers.js"


const taskControllers = () => {

    const addTask = async (req, res) => {
        try {
            const taskSchema = Joi.object({
                name: Joi.string().min(1).max(50).required(),
                projectId: Joi.string().required()
            })
            const { error, value } = taskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const taskExists = await taskHelpers.findTaskByName(value.name, value.projectId)
            if (taskExists) {
                return res.status(200).json({ status: false, message: "Task name already exists" })
            }
            const assigner = req.payload.id

            const allHeaders = await headerHelpers.getHeadersForAddTask()
            if(allHeaders.length){
                value.headers = allHeaders
            }
            const [taskResponse,userNotificationResponse,notificationResponse] = await Promise.all(
                [
                    taskHelpers.addTask(value),
                    userHelpers.addNotificationCount(assigner),
                    notificationHelpers.addNotification({assigner,notification:`added task: ${value.name}`})
                ]
            )
            
            if (taskResponse && notificationResponse) {
                return res.status(200).json({ status: true, data: taskResponse, notification: notificationResponse })
            }
            return res.status(200).json({ status: false, message: "Error adding task" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const getSingleProject = async (req, res) => {
        try {
            const { projectId } = req.params
            const { id } = req.payload
            const projectResponse = await taskHelpers.getSingleProject(projectId, id)
            if (projectResponse.length) {
                return res.status(200).json({ status: true, data: projectResponse })
            }
            return res.status(200).json({ status: false, message: "No projects found" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const removeTask = async (req, res) => {
        try {
            const taskRemoveSchema = Joi.object({
                taskId: Joi.string().required(),
                taskName: Joi.string().required()
            })

            const { error, value } = taskRemoveSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const assigner = req.payload.id

            const [taskRemove,subTaskRemove,chatRemove,notificationCounter,addNotification] = await Promise.all([
                taskHelpers.removeTask(value.taskId),
                subTaskHelpers.removeAllSubTasks(value.taskId),
                chatHelpers.removeChats(value.taskId),
                userHelpers.addNotificationCount(assigner),
                notificationHelpers.addNotification({assigner,notification:`removed a task : ${value.taskName}`})
            ])

            if (taskRemove.acknowledged && subTaskRemove.acknowledged && chatRemove.acknowledged && notificationCounter && addNotification) {
                return res.status(200).json({ status: true, message: "Task removed successfully",notification:addNotification })
            }
            return res.status(200).json({ status: false, message: "Error removing Task" })
        } catch (error) {
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }

    const dndTaskUpdate = async (req, res) => {
        try {
            const dndTaskSchema = Joi.object({
                dragId: Joi.string().required(),
                dropId: Joi.string().required(),
                dragOrder: Joi.number().required(),
                dropOrder: Joi.number().required()
            })
            
            const { error, value } = dndTaskSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { dragId, dragOrder, dropId, dropOrder } = value
            
            const dndTaskResponse = await Promise.all([
                taskHelpers.dndTaskUpdate(dragId, dragOrder),
                taskHelpers.dndTaskUpdate(dropId, dropOrder)
            ])

            const updateStatus = dndTaskResponse.every(response => response.modifiedCount === 1)
            if (updateStatus) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: `Error updating task DnD` })
        } catch (error) {
            console.error('Error in dnd Update:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const dndHeaderUpdate = async (req, res) => {
        try {
            const dndHeaderSchema = Joi.object({
                taskId: Joi.string().required(),
                activeHeaderId: Joi.string().required(),
                activeIndexOrder: Joi.number().required(),
                overHeaderId: Joi.string().required(),
                overIndexOrder: Joi.number().required()
            })
            const { error, value } = dndHeaderSchema.validate(req.body)

            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const { taskId, activeHeaderId, activeIndexOrder, overHeaderId, overIndexOrder } = value

            const dndHeaderResponse = await Promise.all([
                taskHelpers.updateHeaderDnD(taskId, activeHeaderId, overIndexOrder),
                taskHelpers.updateHeaderDnD(taskId, overHeaderId, activeIndexOrder)
            ])

            const updateStatus = dndHeaderResponse.every(response => response.modifiedCount === 1)
            if (updateStatus) {
                return res.status(200).json({ status: true })
            }
            return res.status(200).json({ status: false, message: `Error updating header DnD` })
        } catch (error) {
            console.error('Error in dndHeaderUpdate:', error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const updateTaskName = async(req,res)=>{
        try {
            const taskNameSchema = Joi.object({
                projectId: Joi.string().required(),
                taskId: Joi.string().required(),
                name: Joi.string().max(25).required()
            })
            const { error, value } = taskNameSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const taskExists = await taskHelpers.findTaskByName(value.name, value.projectId)
            if (taskExists && value.taskId !== taskExists._id) {
                return res.status(200).json({ status: false, message: "Task name already exists" })
            }
            
            const taskNameUpdateResponse = await taskHelpers.updateTaskName(value.taskId,value.name)
            if(taskNameUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating name"})
        } catch (error) {
            throw new Error(error.message);
        }
    }


    return {
        addTask,
        getSingleProject,
        removeTask,
        dndTaskUpdate,
        dndHeaderUpdate,
        updateTaskName
    }
}

export default taskControllers;