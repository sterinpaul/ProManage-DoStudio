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

    const uploadProfilePic = async (req, res) => {
        try {
            const profilePhotoURL = req.file.path
            const { id } = req.payload

            const response = await userHelpers.uploadProfilePic(id,profilePhotoURL)
            if(response){
                return res.status(200).json({ status: true,data:profilePhotoURL, message: "Profile picture uploaded" })    
            }
            return res.status(400).json({ status: false, message: "Profile picture could not be uploaded" })
        } catch (error) {
            console.error("Error uploading image", error);
            return res.status(500).json({ status: false, message: "Internal error" })
        }
    }


    return {
        getUserData,
        getUsersAssign,
        getPermissions,
        uploadProfilePic
    }
}

export default userControllers;