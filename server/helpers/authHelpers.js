import AdminModel from "../models/admin.js";
import UserModel from "../models/user.js";
import Token from "../models/token.js";


const authHelpers = {
    signUp:async(email,password)=>{
        const newUser = new UserModel({
            email,
            password
        })
        return await newUser.save()
    },
    getUserByEmail:async(email)=>{
        return await UserModel.findOne({email,isActive:true},{__v:0})
    },
    getAdminByEmail:async(email)=>{
        return await AdminModel.findOne({email},{__v:0})
    },
    // Do not remove {upsert:true,new:true} from addToken query
    addToken:async(userId,token)=>{
        return await Token.findOneAndUpdate({userId},{$set:{token}},{upsert:true,new:true})
    }
}

export default authHelpers;