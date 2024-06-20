import { model, Schema } from "mongoose";
import configKeys from "../config/configKeys.js";


const AdminSchema = new Schema (
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role:{
            type: String,
            default: configKeys.JWT_ADMIN_ROLE
        }
    },
    {
        timestamps: true
    }
)

const AdminModel = model('admin', AdminSchema);
export default AdminModel;

