import { model, Schema } from "mongoose";
import configKeys from "../config/configKeys.js";


const UserSchema = new Schema (
    {
        email: {
            type: String,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        permissions:{
            type: Array,
            default:[]
        },
        isActive:{
            type: Boolean,
            default: true
        },
        role:{
            type: String,
            default: configKeys.JWT_USER_ROLE
        },
        profilePhotoURL:{
            type: String
        }
    },
    {
        timestamps: true
    }
)


const UserModel = model('users', UserSchema);
export default UserModel;

