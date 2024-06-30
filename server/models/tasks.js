import mongoose,{ model, Schema } from "mongoose";


const TaskSchema = new Schema (
    {
        projectId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project',
            required: true
        },
        name: {
            type: String,
            unique: true,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        headers:{
            type:Array,
            default:[]
        },
        isActive:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

const TaskModel = model('tasks', TaskSchema);
export default TaskModel;
