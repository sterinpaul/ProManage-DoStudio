import { model, Schema } from "mongoose";


const ProjectSchema = new Schema (
    {
        name: {
            type: String,
            unique: true,
            required: true
        },
        description:{
            type: String,
            required: true
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

const ProjectModel = model('project', ProjectSchema);
export default ProjectModel;

