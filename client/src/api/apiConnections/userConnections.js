import { toast } from 'react-toastify';
import baseURL from '../baseURL'


export const getUserData = async() => {
    try{
        const response = await baseURL.get(`/user/getUserData`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error fetching user data: ${error.message}`);
        toast.error("Internal error")
    }
}

export const getAllNotifications = async(skip) => {
    try{
        const response = await baseURL.get(`/notifications/getNotifications/${skip}`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error fetching notifications : ${error.message}`);
        toast.error("Internal error")
    }
}

export const resetUserNotifications = async() => {
    try{
        const response = await baseURL.patch(`/user/resetNotifications`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error resetting notification count: ${error.message}`);
        toast.error("Internal error")
    }
}

export const getUsersForAssignSubTask = async() => {
    try{
        const response = await baseURL.get(`/user/getUsersAssign`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error fetching users: ${error.message}`);
        toast.error("Internal error")
    }
}

export const uploadProfilePic = async (imageFile) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await baseURL.post(`/user/uploadProfilePic`, formData, {
            headers: {
                'Content-Type' : 'multipart/form-data'
            }
        })
        
        if(response) return response.data
        
    } catch (error) {
        console.error('Error updating profile pic:', error);
    }
}
