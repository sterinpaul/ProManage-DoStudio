import mongoose,{ model, Schema } from "mongoose";


const SubTaskSchema = new Schema (
    {
        taskId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tasks',
            required: true
        },
        name: {
            type: String
        },
        isActive:{
            type: Boolean,
            default: true
        },
        status:{
            type: String,
            default: "not started"
        },
        dueDate:{
            type: String
        },
        priority:{
            type: String,
            default: "normal"
        },
        notes:{
            type: String
        },
        people:{
            type: mongoose.Schema.Types.Mixed,
            ref: 'users'
        }
    },
    {
        timestamps: true
    }
)

const SubTaskModel = model('subtasks', SubTaskSchema);
export default SubTaskModel;
