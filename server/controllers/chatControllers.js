import Joi from 'joi'
import chatHelpers from '../helpers/chatHelpers.js'
import unreadChatHelpers from '../helpers/unreadChatHelpers.js'


const chatControllers = () => {
    const getChatMessages = async (req,res)=>{
        try {
            const {roomId} = req.params
            const response = await chatHelpers.getChatMessages(roomId)

            if(response.length){
                return res.status(200).json({status:true,data:response})
            }
            return res.status(200).json({status:false,message:"No messages found"})
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const sendMessage = async (req,res)=>{
        try {
            const messageSchema = Joi.object({
                roomId: Joi.string().required(),
                sender: Joi.string().required(),
                type: Joi.string().valid("text").required(),
                message: Joi.string().min(1).max(2000).required()
            })
            const { error, value } = messageSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const [sendResponse,unreadResponse] = await Promise.allSettled([
                chatHelpers.sendMessage(value),
                unreadChatHelpers.updateChatUnreadCount(value.roomId,value.sender)
            ])
            
            if(sendResponse.status === "fulfilled" && unreadResponse.status === "fulfilled"){
                return res.status(200).json({status:true,data:sendResponse.value})
            }
            return res.status(200).json({status:false,message:"Message could not send"})
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const sendImage = async (req,res)=>{
        try {
            const url = req.file.path
            const messageSchema = Joi.object({
                roomId: Joi.string().required(),
                sender: Joi.string().required(),
                type: Joi.string().valid("image").required()
            })
            const { error, value } = messageSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const [sendResponse,unreadResponse] = await Promise.allSettled([
                chatHelpers.sendMessage({...value,url}),
                unreadChatHelpers.updateChatUnreadCount(value.roomId,value.sender)
            ])
            
            if(sendResponse.status === "fulfilled" && unreadResponse.status === "fulfilled"){
                return res.status(200).json({status:true,data:sendResponse.value})
            }
            return res.status(200).json({status:false,message:"Message could not send"})
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const updateUnreadChat = async(req,res)=>{
        try {
            const unreadChatSchema = Joi.object({
                roomId: Joi.string().required(),
                userId: Joi.string().required()
            })
            const { error, value } = unreadChatSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const updateResponse = await unreadChatHelpers.updateUnreadChat(value)
            if(!updateResponse.acknowledged){
                return res.status(200).json({ status: false, message: "Could not update read status" })
            }
        } catch (error) {
            return res.status(500).json({ status: false, message: error.message });
        }
    }

    const uploadFile = async (req, res) => {
        try {
            const ticketUrl = req.file.path
            const { orderId } = req.params

            return res.status(200).json({ status: false, message: "Ticket could not be uploaded" })
        } catch (error) {
            console.error("Error uploading invoice", error);
            return res.status(500).json({ status: false, message: error.message });
        }
    }


    return {
        getChatMessages,
        sendMessage,
        sendImage,
        updateUnreadChat,
        uploadFile
    }
}

export default chatControllers;