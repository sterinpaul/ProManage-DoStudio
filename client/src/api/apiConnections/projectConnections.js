import { toast } from 'react-toastify';
import baseURL from '../baseURL'


export const getAllProjects = async() => {
    try{
        const response = await baseURL.get(`/projects/getAllProjects`);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to fetch projects');
        }
    }catch(error){
        console.error(`Error fetching projects: ${error.message}`);
        toast.error(error.message)
    }
}

export const getSingleProject = async(projectId) => {
    try{
        const response = await baseURL.get(`/tasks/getSingleProject/${projectId}`);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to fetch project');
        }
    }catch(error){
        console.error(`Error fetching project: ${error.message}`);
        toast.error(error.message)
    }
}

export const addProject = async(projectData) => {
    try{
        const response = await baseURL.post(`/projects/addProject`,projectData);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to add project');
        }
    }catch(error){
        console.error(`Error adding project: ${error.message}`);
        toast.error(error.message)
    }
}

export const addTask = async(taskData) => {
    try{
        const response = await baseURL.post(`/tasks/addTask`,taskData);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to add task');
        }
    }catch(error){
        console.error(`Error adding task: ${error.message}`);
        toast.error(error.message)
    }
}

export const addSingleSubTask = async(taskId) => {
    try{
        const response = await baseURL.post(`/subTasks/addSubTask`,{taskId});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to add sub task');
        }
    }catch(error){
        console.error(`Error adding sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSubTaskName = async(subTaskId,name) => {
    try{
        const response = await baseURL.patch(`/subTasks/updateName`,{subTaskId,name});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to update name');
        }
    }catch(error){
        console.error(`Error updating name: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSubTaskNote = async(subTaskId,notes) => {
    try{
        const response = await baseURL.patch(`/subTasks/updateNote`,{subTaskId,notes});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to update note');
        }
    }catch(error){
        console.error(`Error updating note: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateStatus = async(subTaskId,status) => {
    try{
        const response = await baseURL.patch(`/subTasks/updateStatus`,{subTaskId,status});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to update status');
        }
    }catch(error){
        console.error(`Error updating status: ${error.message}`);
        toast.error(error.message)
    }
}

export const updatePriority = async(subTaskId,priority) => {
    try{
        const response = await baseURL.patch(`/subTasks/updatePriority`,{subTaskId,priority});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to update priority');
        }
    }catch(error){
        console.error(`Error updating priority: ${error.message}`);
        toast.error(error.message)
    }
}

export const dueDateUpdate = async(subTaskId,dueDate) => {
    try{
        const response = await baseURL.patch(`/subTasks/updateDueDate`,{subTaskId,dueDate});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to update the due date');
        }
    }catch(error){
        console.error(`Error updating due date: ${error.message}`);
        toast.error(error.message)
    }
}

export const removeSubTasks = async(subTaskIds) => {
    try{
        const response = await baseURL.patch(`/subTasks/removeSubTask`,{subTaskIds});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to remove sub task');
        }
    }catch(error){
        console.error(`Error removing sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const subTaskToPerson = async(subTaskId,userId) => {
    try{
        const response = await baseURL.patch(`/subTasks/assignSubTask`,{subTaskId,userId});
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to assign the task');
        }
    }catch(error){
        console.error(`Error assigning sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const removeATask = async(taskId) => {
    try{
        const response = await baseURL.delete(`/tasks/removeTask/${taskId}`);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to remove the task');
        }
    }catch(error){
        console.error(`Error removing task: ${error.message}`);
        toast.error(error.message)
    }
}

export const addHeader = async(header) => {
    try{
        const response = await baseURL.post(`/headers/addHeader`,header);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed add header');
        }
    }catch(error){
        console.error(`Error adding header: ${error.message}`);
        toast.error(error.message)
    }
}
