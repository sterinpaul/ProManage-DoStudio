import Joi from "joi"
import subTaskHelpers from "../helpers/subTaskHelpers.js"
import chatHelpers from "../helpers/chatHelpers.js"


const subTaskControllers = () => {

    const addSubTask = async(req,res)=>{
        try {
            const subTaskSchema = Joi.object({
                taskId: Joi.string().required()
            })
            const { error, value } = subTaskSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTask = {taskId:value.taskId,name:"",status:"not started",dueDate:"",priority:"normal",notes:"",people:""}
            const subTaskResponse = await subTaskHelpers.addSubTask(subTask)
            if(subTaskResponse){
                return res.status(200).json({status:true,data:subTaskResponse})
            }
            return res.status(200).json({status:false,message:"Error adding Sub task"})
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    const updateSubTaskName = async(req,res)=>{
        try {
            const subTaskNameSchema = Joi.object({
                subTaskId: Joi.string().required(),
                name: Joi.string().max(25).required()
            })
            const { error, value } = subTaskNameSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTaskNameUpdateResponse = await subTaskHelpers.updateSubTaskName(value)
            if(subTaskNameUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating name"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskNote = async(req,res)=>{
        try {
            const subTaskNoteSchema = Joi.object({
                subTaskId: Joi.string().required(),
                notes: Joi.string().max(150).required()
            })
            const { error, value } = subTaskNoteSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTaskNoteUpdateResponse = await subTaskHelpers.updateSubTaskNote(value)
            if(subTaskNoteUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating note"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskStatus = async(req,res)=>{
        try {
            const subTaskStatusSchema = Joi.object({
                subTaskId: Joi.string().required(),
                status: Joi.string().max(25).required()
            })
            const { error, value } = subTaskStatusSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTaskStatusUpdateResponse = await subTaskHelpers.updateSubTaskStatus(value)
            if(subTaskStatusUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating status"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateSubTaskPriority = async(req,res)=>{
        try {
            const subTaskPrioritySchema = Joi.object({
                subTaskId: Joi.string().required(),
                priority: Joi.string().max(25).required()
            })
            const { error, value } = subTaskPrioritySchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTaskPriorityUpdateResponse = await subTaskHelpers.updateSubTaskPriority(value)
            if(subTaskPriorityUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating priority"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const updateDueDate = async(req,res)=>{
        try {
            const dueDateSchema = Joi.object({
                subTaskId: Joi.string().required(),
                dueDate: Joi.string().required()
            })
            const { error, value } = dueDateSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const subTaskDateUpdateResponse = await subTaskHelpers.updateDueDate(value)
            if(subTaskDateUpdateResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error updating due date"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const assignSubTask = async(req,res)=>{
        try {
            const subTaskAssignSchema = Joi.object({
                subTaskId: Joi.string().required(),
                userId: Joi.string().required()
            })
            const { error, value } = subTaskAssignSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const {subTaskId,userId} = value
            const assignResponse = await subTaskHelpers.updatePeople(subTaskId,userId)
            if(assignResponse.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Error assigning person"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const removeSubTsk = async(req,res)=>{
        try {
            const removeSubTaskSchema = Joi.array().items(Joi.string().required()).min(1)
            const { error, value } = removeSubTaskSchema.validate(req.body.subTaskIds)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const queryArray = []
            value.forEach(id=>{
                queryArray.push(subTaskHelpers.removeSubTask(id))
                queryArray.push(chatHelpers.removeChats(id))
            })

            const subTaskRemoveResponse = await Promise.all(queryArray)
            const removeStatus = subTaskRemoveResponse.every(response=>response.acknowledged)
            if(removeStatus){
                return res.status(200).json({status:true,message:`${value.length>1 ? "Sub tasks" : "Sub task"} removed`})
            }
            return res.status(200).json({status:false,message:`Error removing ${value.length>1 ? "sub tasks" : "sub task"}`})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    
    return {
        addSubTask,
        updateSubTaskName,
        updateSubTaskNote,
        updateSubTaskStatus,
        updateSubTaskPriority,
        updateDueDate,
        assignSubTask,
        removeSubTsk
    }
}

export default subTaskControllers;