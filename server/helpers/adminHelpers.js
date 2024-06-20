import AdminModel from "../models/admin.js";


const adminHelpers = {
    getAdminData:async(_id)=>{
        return await AdminModel.findOne({_id},{email:1,role:1})
    }
}

export default adminHelpers;