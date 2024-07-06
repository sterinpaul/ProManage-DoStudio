import baseURL from '../baseURL'


export const signIn = async(credentials) => {
    try{
        const response = await baseURL.post(`/auth/signIn`,credentials);
        if (response) {
            return response.data
        }
    }catch(error){
        console.error(`Error signing in ${error.message}`);
    }
}


export const signUp = async(credentials) => {
    try{
        const response = await baseURL.post(`/auth/signUp`,credentials);
        if (response) {
            return response.data
        }
    }catch(error){
        console.error(`Error signing up ${error.message}`);
    }
}


export const userSignOut = async(id)=>{
    try{
        const response = await baseURL.delete(`/auth/signOut/${id}`);
        if (response) {
            return response.data
        }
    }catch(error){
        console.error(`Error signing out: ${error.message}`);
    }
}

export const getUserData = async()=>{
    try{
        const response = await baseURL.get(`/auth/getUser`);
        if (response) {
            return response.data
        }
    }catch(error){
        console.error(`Error fetching user data ${error.message}`);
    }
}

export const createSubadmin = async(subadminData)=>{
    try{
        const response = await baseURL.post(`/superAdmin/register`, subadminData);
        if (response) {
            return response.data
        }
    }catch(error){
        console.error(`Error creating sub admin: ${error.message}`);
    }
}

export const handleChangePassword = async (oldPassword, newPassword) => {
    try {
        const response = await baseURL.put(`/auth/change-password`, { oldPassword, newPassword });
        return response.data;
    } catch (error) {
        console.error(`Error changing password: ${error.message}`);
    }
}

