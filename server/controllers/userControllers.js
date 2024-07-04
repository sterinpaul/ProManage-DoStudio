import Joi from 'joi'
import userHelpers from '../helpers/userHelpers.js'
import permissionHelpers from '../helpers/permissionHelpers.js'


const userControllers = () => {
    const getUserData = async (req,res)=>{
        try {
            const {id} = req.payload
            const response = await userHelpers.getUserData(id)
            if(response){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const getUsersAssign = async (req,res)=>{
        try {
            const response = await userHelpers.getUsersForAssign()
            if(response.length){
                return res.status(200).json({status:true,data:response})
            }
        } catch (error) {
            throw new Error(error.message);
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

    const uploadProfileImg = async (req, res) => {
        try {
            const ticketUrl = req.file.path
            const { orderId } = req.params

            return res.status(200).json({ status: false, message: "Ticket could not be uploaded" })
        } catch (error) {
            console.error("Error uploading invoice", error);
            throw new Error(error.message);
        }
    }


    return {
        getUserData,
        getUsersAssign,
        getPermissions,
        uploadProfileImg
    }
}

export default userControllers;