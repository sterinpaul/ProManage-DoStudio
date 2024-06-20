import UserModel from "../models/user.js";


const userHelpers = {
    getUserData:async(_id)=>{
        return await UserModel.findOne({_id},{email:1,permissions:1,role:1})
    },
    getAllUsers:async()=>{
        return await UserModel.find({},{__v:0,password:0,role:0}).sort({isActive:1})
    },
    getUsersForAssign:async()=>{
        return await UserModel.find({isActive:true},{email:1,profilePhotoURL:1})
    },
    updateUserStatus:async(_id,isActive)=>{
        return await UserModel.updateOne({_id},{$set:{isActive}})
    },
    updatePermissions:async(_id,permissions)=>{
        return await UserModel.updateOne({_id},{$set:{permissions}})
    },
    getUserPermissions:async(_id)=>{
        return await UserModel.findOne({_id},{permissions:1})
    }
}

export default userHelpers;