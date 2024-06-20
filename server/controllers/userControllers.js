import Joi from 'joi'
import userHelpers from '../helpers/userHelpers.js'
import adminHelpers from '../helpers/adminHelpers.js'
import configKeys from '../config/configKeys.js'


const userControllers = () => {
    const getUserData = async (req,res)=>{
        try {
            const {id,role} = req.payload
            let response;
            if(role === configKeys.JWT_USER_ROLE){
                response = await userHelpers.getUserData(id)
            }

            if(role === configKeys.JWT_ADMIN_ROLE){
                response = await adminHelpers.getAdminData(id)
            }

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



    const uploadTicket = async (req, res) => {
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
        uploadTicket
    }
}

export default userControllers;