import { model, Schema } from "mongoose";


const HeaderSchema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        key: {
            type: String,
            unique: true,
            required: true
        },
        order: {
            type: Number,
            required: true
        }
    }
)


const HeaderModel = model('headers', HeaderSchema);
export default HeaderModel;
