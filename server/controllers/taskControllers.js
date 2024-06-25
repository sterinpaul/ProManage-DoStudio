import Joi from "joi"
import taskHelpers from "../helpers/taskHelpers.js"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"


const taskControllers = () => {

    const addTask = async(req,res)=>{
        try {
            const taskSchema = Joi.object({
                name: Joi.string().min(1).max(25).required(),
                description: Joi.string().min(1).max(150).required(),
                projectId:Joi.string().required()
            })
            const { error, value } = taskSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            value.name = value.name.toLowerCase()
            const taskExists = await taskHelpers.findTaskByName(value.name,value.projectId)
            if(taskExists){
                return res.status(200).json({status:false,message:"Task name already exists"})
            }

            const taskResponse = await taskHelpers.addTask(value)
            if(taskResponse){
                return res.status(200).json({status:true,data:taskResponse})
            }
            return res.status(200).json({status:false,message:"Error adding task"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const getSingleProject = async(req,res)=>{   
        try {
            const {projectId} = req.params
            const {id} = req.payload
            const projectResponse = await taskHelpers.getSingleProject(projectId,id)
            if(projectResponse.length){
                return res.status(200).json({status:true,data:projectResponse})
            }
            return res.status(200).json({status:false,message:"No projects found"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const removeTask = async(req,res)=>{
        try {
            const {taskId} = req.params
            const removeResponse = await Promise.all([
                taskHelpers.removeTask(taskId),
                subTaskHelpers.removeAllSubTasks(taskId),
                chatHelpers.removeChats(taskId)
            ])
            
            const removeStatus = removeResponse.every(each=>each.acknowledged)

            if(removeStatus){
                return res.status(200).json({status:true,message:"Task removed successfully"})
            }
            return res.status(200).json({status:false,message:"Error removing Task"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    
    return {
        addTask,
        getSingleProject,
        removeTask
    }
}

export default taskControllers;