import Joi from 'joi'
import userHelpers from '../helpers/userHelpers.js'
import headerHelpers from '../helpers/headerHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'
import projectHelpers from '../helpers/projectHelpers.js'
import taskHelpers from '../helpers/taskHelpers.js'
import chatHelpers from '../helpers/chatHelpers.js'
import subTaskHelpers from '../helpers/subTaskHelpers.js'


const adminControllers = () => {
    const getAllUsers = async (req, res) => {
        try {
            const getUsersResponse = await userHelpers.getAllUsers()
            return res.status(200).json({status:true,data:getUsersResponse})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const getHeaders = async (req, res) => {
        try {
            const response = await headerHelpers.getHeaders()
            return res.status(200).json({status:true,data:response})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const getPermissions = async (req, res) => {
        try {
            const response = await permissionHelpers.getPermissions()
            return res.status(200).json({status:true,data:response})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const addPermission = async (req, res) => {
        try {
            const permissionSchema = Joi.object({
                key: Joi.string().required(),
                name: Joi.string().required()
            })
            const { error, value } = permissionSchema.validate(req.body)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const response = await permissionHelpers.addPermission(value)
            return res.status(200).json({status:true,data:response})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const updateUserStatus = async (req, res) => {
        try {
            const statusSchema = Joi.object({
                id: Joi.string().required(),
                isActive: Joi.boolean().required()
            })
            const { error, value } = statusSchema.validate(req.body)
            
            if (error) {
                return res.status(500).json({ status: false, message: error.details[0].message })
            }

            const { id, isActive } = value
            const response = await userHelpers.updateUserStatus(id,isActive)
            if(response.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Updation failed"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const updatePermissions = async (req, res) => {
        try {
            const permissionSchema = Joi.object({
                userId: Joi.string().required(),
                permissions: Joi.array().required()
            })
            const { error, value } = permissionSchema.validate(req.body)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const { userId, permissions } = value
            const response = await userHelpers.updatePermissions(userId,permissions)
            if(response.modifiedCount){
                return res.status(200).json({status:true,message:"Permissions updated"})
            }
            return res.status(200).json({status:false,message:"Permission updation failed"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const updateProjectName = async (req, res) => {
        try {
            const updateSchema = Joi.object({
                _id: Joi.string().required(),
                name: Joi.string().min(1).max(25).required()
            })
            const { error, value } = updateSchema.validate(req.body)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const response = await projectHelpers.updateProjectName(value)
            if(response.modifiedCount){
                return res.status(200).json({status:true,message:"Project name updated"})
            }
            return res.status(400).json({status:false,message:"Project name updation failed"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }

    const removeProject = async (req, res) => {
        try {
            const removeSchema = Joi.object({
                projectId: Joi.string().required()
            })
            const { error, value } = removeSchema.validate(req.params)
            
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            const promiseArray = []
            promiseArray.push(projectHelpers.removeProject(value.projectId))
            const taskExists = await taskHelpers.findTasksForRemoval(value.projectId)
            
            if(taskExists.length){
                const tasks = taskExists.map(id=>subTaskHelpers.findSubTasksForRemoval(id))

                promiseArray.push(taskHelpers.removeTasks(value.projectId))
                
                const subTaskExists = await Promise.all(tasks)
                const flattedSubTasks = subTaskExists?.flatMap(id=>id)
                
                if(flattedSubTasks.length){
                    taskExists.forEach(taskId=>promiseArray.push(subTaskHelpers.removeAllSubTasks(taskId)))
                    flattedSubTasks.forEach(roomId=>{
                        promiseArray.push(chatHelpers.removeChats(roomId))
                    })
                }
            }

            const response = await Promise.all(promiseArray)
            
            const responseStatus = response.every(eachQuery=>eachQuery.acknowledged)
            
            if(!responseStatus){
                return res.status(400).json({status:false,message:"Project removal failed"})
            }
            return res.status(200).json({status:true,message:"Project removed"})
        } catch (error) {
            return res.status(500).json({status:false,message:"Internal error"})
        }
    }


    return {
        getAllUsers,
        getHeaders,
        getPermissions,
        addPermission,
        updateUserStatus,
        updatePermissions,
        updateProjectName,
        removeProject
    }
}

export default adminControllers;