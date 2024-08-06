import { toast } from 'react-toastify';
import baseURL from '../baseURL'
import axios from 'axios';


export const getSubTaskChatMessages = async(roomId,skip) => {
    try{
        const response = await baseURL.get(`/chat/getChatMessages/${roomId}/${skip}`);
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

export const sendSingleFile = async(roomId,sender,type,file) => {
    try{
        const formData = new FormData()
        
        formData.append('roomId',roomId)
        formData.append('sender',sender)
        formData.append('type',type)
        formData.append('file',file)

        const response = await baseURL.post(`/chat/sendFile`,formData,{
            headers:{'Content-Type' : 'multipart/form-data'}
        });

        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error sending message: ${error.message}`);
        toast.error("Internal error")
    }
}

export const readChatUpdation = async(userId,roomId) => {
    try{
        const response = await baseURL.patch(`/chat/updateUnreadChat`,{userId,roomId});
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error updating read status: ${error.message}`);
        toast.error("Internal error")
    }
}

export const getBlobFileDownload = async(fileUrl) => {
    try{
        const response = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'blob',
        })
        if (response) {
            return response.data;
        }
    }catch(error){
        console.error(`Error getting file ${error.message}`);
        toast.error("Internal error")
    }
}

export const removeChatMessage = async(chatId)=>{
    try {
        const response = await baseURL.delete(`/chat/removeChat/${chatId}`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error removing file ${error.message}`);
        toast.error("Internal error")
    }
}
