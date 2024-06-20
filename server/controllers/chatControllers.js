import Joi from 'joi'
import chatHelpers from '../helpers/chatHelpers.js'


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
            throw new Error(error.message);
        }
    }

    const sendMessage = async (req,res)=>{
        try {
            const messageSchema = Joi.object({
                roomId: Joi.string().required(),
                sender: Joi.string().required(),
                message: Joi.string().min(1).max(2000).required()
            })
            const { error, value } = messageSchema.validate(req.body)
    
            if (error) {
                return res.status(200).json({ status: false, message: error.details[0].message })
            }
            
            const response = await chatHelpers.sendMessage(value)
            if(response){
                return res.status(200).json({status:true,data:response})
            }
            return res.status(200).json({status:false,message:"Message could not send"})
        } catch (error) {
            throw new Error(error.message);
        }
    }

    const uploadFile = async (req, res) => {
        try {
            const ticketUrl = req.file.path
            const { orderId } = req.params

            return res.status(200).json({ status: false, message: "Ticket could not be uploaded" })
        } catch (error) {
            console.error("Error uploading invoice", error);
            throw new Error(error.message);
        }
    }


    return {
        getChatMessages,
        sendMessage,
        uploadFile
    }
}

export default chatControllers;