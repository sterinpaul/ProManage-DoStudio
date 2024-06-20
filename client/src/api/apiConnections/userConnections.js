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
