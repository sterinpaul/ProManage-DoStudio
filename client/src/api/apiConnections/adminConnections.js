import { toast } from 'react-toastify';
import baseURL from '../baseURL'


export const getAllUsers = async() => {
    try{
        const response = await baseURL.get(`/admin/getAllUsers`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error fetching users: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSingleUserActivity = async(id,isActive)=>{
    try{
        const response = await baseURL.patch(`/admin/userStatus`,{id,isActive})
        if(response) return response.data
    }catch(error){
        toast.error(error.message)
    }
}

export const updatePermissions = async(userId,permissions)=>{
    try{
        const response = await baseURL.put(`/admin/updatePermissions`,{userId,permissions})
        if(response) return response.data
    }catch(error){
        toast.error(error.message)
    }
}

export const getSubAdminById = async(id) => {
    try{
        const response = await baseURL.get(`/subadmins/get-subadminById/${id}`);
        if (response) {
            return response.data;
        } else {
            throw new Error('Failed to fetch sub admins');
        }
    }catch(error){
        console.error(`Error fetching sub admin: ${error.message}`);
        throw new Error(`Error fetching sub admin: ${error.message}`);
    }
}

export const editSubadmin = async(id, updatedData) => {
    try{
        const response = await baseURL.put(`/subadmins/edit-subadmin/${id}`, updatedData);
        if (response) {
            return response.data
        } else {
            throw new Error('Failed to edit sub admins');
        }
    }catch(error){
        console.error(`Error edit sub admin: ${error.message}`);
        throw new Error(`Error edit sub admin: ${error.message}`);
    }
}

export const removeUser = async(id) => {
    try{
        const response = await baseURL.delete(`/subadmins/delete-subadmin/${id}`);
        if (response) {
            return response.data
        } else {
            throw new Error('Failed to delete sub admin');
        }
    }catch(error){
        console.error(`Error delete sub admin: ${error.message}`);
        throw new Error(`Error delete sub admin: ${error.message}`);
    }
}
