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
    
}

export default projectHelpers;