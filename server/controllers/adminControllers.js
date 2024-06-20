import Joi from 'joi'
import adminHelpers from '../helpers/adminHelpers.js'
import userHelpers from '../helpers/userHelpers.js'


const adminControllers = () => {
    const getAllUsers = async (req, res) => {
        try {
            const getUsersResponse = await userHelpers.getAllUsers()
            if(getUsersResponse.length){
                return res.status(200).json({status:true,data:getUsersResponse})
            }
            return res.status(200).json({status:false,message:"No users found"})
        } catch (error) {
            throw new Error(error.message)
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
        updateUserStatus,
        updatePermissions
    }
}

export default adminControllers;