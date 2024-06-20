import { toast } from 'react-toastify';
import baseURL from '../baseURL'


export const getSubTaskChatMessages = async(roomId) => {
    try{
        const response = await baseURL.get(`/chat/getChatMessages/${roomId}`);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error fetching chat messages: ${error.message}`);
        toast.error("Internal error")
    }
}

export const sendSingleMessage = async(messageData) => {
    try{
        const response = await baseURL.post(`/chat/sendMessage`,messageData);
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error sending message: ${error.message}`);
        toast.error("Internal error")
    }
}
