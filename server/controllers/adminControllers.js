import Joi from 'joi'
import userHelpers from '../helpers/userHelpers.js'
import headerHelpers from '../helpers/headerHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'


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
                return res.status(200).json({ status: false, message: error.details[0].message })
            }

            const { id, isActive } = value
            const response = await userHelpers.updateUserStatus(id,isActive)
            if(response.modifiedCount){
                return res.status(200).json({status:true})
            }
            return res.status(200).json({status:false,message:"Updation failed"})
        } catch (error) {
            throw new Error(error.message)
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
            throw new Error(error.message)
        }
    }


    return {
        getAllUsers,
        getHeaders,
        getPermissions,
        addPermission,
        updateUserStatus,
        updatePermissions
    }
}

export default adminControllers;