import mongoose from "mongoose";
import ProjectModel from "../models/projects.js";


const projectHelpers = {
    getAllProjects:async()=>{
        return await ProjectModel.find({isActive:true}).sort({createdAt:-1})
    },
    findProjectByName:async(name)=>{
        return await ProjectModel.findOne({isActive:true,name})
    },
    addProject:async(projectData)=>{
        const newProject = new ProjectModel(projectData)
        return await newProject.save()
    },
    updateProjectName:async({_id,name})=>{
        return await ProjectModel.updateOne({_id},{$set:{name}})
    },
    removeProject:async(_id)=>{
        return await ProjectModel.updateOne({_id},{$set:{isActive:false}})
    }
}

export default projectHelpers;