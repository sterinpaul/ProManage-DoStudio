import { Button, Dialog,DialogBody, Spinner } from "@material-tailwind/react"
import { useEffect, useRef, useState } from "react"
import { MdImage, MdClose, MdAttachFile } from "react-icons/md"
import { CiCircleRemove } from "react-icons/ci"
import { getSubTaskChatMessages, readChatUpdation, sendSingleMessage } from "../../api/apiConnections/chatConnections"
import InputEmoji from "react-input-emoji"
import moment from "moment"
import { useRecoilValue,useRecoilState,useSetRecoilState } from "recoil"
import { userDataAtom } from "../../recoil/atoms/userAtoms"
import { toast } from "react-toastify"
import { currentProjectAtom, taskSubTaskAtom } from "../../recoil/atoms/projectAtoms"
import { allChatMessageAtom, socketMessageAtom } from "../../recoil/atoms/chatAtoms"


export const SubTaskChat = ({ subTaskChatModalHandler }) => {
    const userData = useRecoilValue(userDataAtom)
    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const [taskSubTaskId,setTaskSubTaskId] = useRecoilState(taskSubTaskAtom)
    const [messages, setMessages] = useRecoilState(allChatMessageAtom)
    const [singleMessage, setSingleMessage] = useState("")
    const setSocketMessage = useSetRecoilState(socketMessageAtom)
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [imgChat, setImgChat] = useState(null)
    const [loading, setLoading] = useState(false)


    const chatRef = useRef(null)
    const textAreaRef = useRef(null)


    const readChats = async () => {
        setSelectedProject(previous => previous.map(task => task._id === taskSubTaskId.taskId ? { ...task, subTasks: task.subTasks.map(subTask => subTask._id === taskSubTaskId.subTaskId ? { ...subTask, chatUnreadCount: 0 } : subTask) } : task))
        const readUpdation = await readChatUpdation(userData._id, taskSubTaskId.subTaskId)
        if (!readUpdation?.status) {
            toast.error("Error in update read status")
        }
    }

    const getChatMessages = async () => {
        const response = await getSubTaskChatMessages(taskSubTaskId?.subTaskId)
        if (response?.status) {
            setMessages(response.data)
        }
        readChats()
    }

    useEffect(() => {
        getChatMessages()
        return()=>{
            setMessages([])
            setTaskSubTaskId({taskId:"",subTaskId:""})
        }
    }, [])


    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages])

    const send = async () => {
        const response = await sendSingleMessage({ roomId: taskSubTaskId.subTaskId, sender: userData._id, type:"text", message: singleMessage })
        if (response?.status) {
            setSocketMessage({ ...response.data, user: userData.email,taskId:taskSubTaskId.taskId })
            setMessages(previous => [...previous, { ...response.data, user: userData.email }])
            setSingleMessage("")
        }
    }

    const sendImage = async()=>{
        setLoading(true)
        const response = await sendSingleImage(taskSubTaskId.subTaskId,userData._id,"image",imgChat)
        if(!response?.status){
            toast.error(response.message)
        }
        setLoading(false)
    }


    const uploadModalHandler = () => {
        if(openUploadModal && imgChat){
            setImgChat(null)
        }
        setOpenUploadModal(previous => !previous)
    }

    return (
        <div className="relative w-full flex flex-col justify-between">
            <div onClick={subTaskChatModalHandler} className="absolute z-10 group cursor-pointer right-2 top-2 rounded-full p-1 transition hover:bg-black bg-blue-gray-100 ">
                <MdClose className="w-4 h-4 transition text-black group-hover:text-white" />
            </div>
            <DialogBody>
                <div className="flex w-full h-96 overflow-y-scroll mt-6 flex-col items-center gap-2 rounded border border-gray-900/10 bg-gray-900/5 p-2">
                    {messages?.length ? messages.map((singleMessage, index) => {
                        const userId = singleMessage.user ? singleMessage.user.split("@")[0] : "admin"
                        return (
                            userData._id === singleMessage.sender ? <div ref={index === messages.length - 1 ? chatRef : null} className="self-end p-1.5 w-fit rounded-s-3xl rounded-t-3xl bg-brown-100" key={singleMessage._id}>
                                <p className="px-2 font-semibold capitalize max-w-36 whitespace-nowrap overflow-hidden overflow-ellipsis">{userId}</p>
                                <p className="text-black px-2 break-words max-w-xs md:max-w-96">{singleMessage.message}</p>
                                <p className="text-xs text-right px-2">{moment(singleMessage.createdAt).startOf('seconds').fromNow()}</p>
                            </div> : <div ref={index === messages.length - 1 ? chatRef : null} className="self-start p-1.5 w-fit rounded-e-3xl rounded-t-3xl bg-light-blue-100" key={singleMessage._id}>
                                <p className="px-2 font-semibold capitalize max-w-36 whitespace-nowrap overflow-hidden overflow-ellipsis">{userId}</p>
                                <p className="text-black px-2 break-words max-w-xs md:max-w-96">{singleMessage.message}</p>
                                <p className="text-xs text-left px-2">{moment(singleMessage.createdAt).startOf('seconds').fromNow()}</p>
                            </div>
                        )
                    }) : <div className="flex items-center justify-center w-full h-full"><p>No Messages</p></div>}
                </div>
            </DialogBody>
            <div className="flex flex-nowrap justify-center items-center px-4 mb-4">
                <div onClick={setOpenUploadModal} className="cursor-pointer p-1 border rounded-full hover:shadow-lg bg-gray-100 group">
                    <MdImage className="w-5 h-5 group-hover:text-blue-500" />
                </div>
                <InputEmoji ref={textAreaRef} onChange={setSingleMessage} value={singleMessage} cleanOnEnter onEnter={send} maxLength={2000} shouldReturn placeholder="Type something" />
                <MdAttachFile className="w-5 h-5 rotate-45" />
            </div>

            {/* Image Upload */}
            <Dialog dismiss={{ escapeKey: false, outsidePress: false }} open={openUploadModal} handler={uploadModalHandler} size="xs" className="outline-none" >

                <div className="m-2 flex flex-col justify-center items-center">
                  
                    <div className="flex flex-col justify-center items-center">
                      {imgChat ? (
                        <div className="relative">
                            <img className="max-h-96 max-w-96 w-fit" src={imgChat && URL.createObjectURL(imgChat)} />
                            <div onClick={()=>setImgChat(null)} className="absolute cursor-pointer group top-0 flex justify-center items-center w-full h-full bg-opacity-0 hover:bg-opacity-50 bg-blue-gray-500">
                                <CiCircleRemove className="w-12 h-12 hidden group-hover:block text-white"/>
                            </div>
                            {loading && <div className="absolute top-0 flex justify-center items-center w-full h-full bg-white"><Spinner color="blue" className="w-12 h-12"/></div>}
                        </div>
                      ) : <><label className="w-20 bg-blue-500 hover:bg-blue-600 text-white text-center py-1 rounded-lg cursor-pointer">Choose
                        <input className="hidden" onChange={(e) => setImgChat(e.target?.files?.[0])} name='image' type="file" accept=".jpg,.jpeg,.png,.gif" />
                      </label>
                      <p className="file-label">Allowed formats: jpg, jpeg, png, gif</p></>}
                      

                      <div className="flex gap-4 mt-2">
                        <Button onClick={sendImage} disabled={imgChat ? false : true} color="black" className="w-24 py-2">Send</Button>
                        <Button onClick={uploadModalHandler} color="black" className="w-24 py-2">Cancel</Button>
                      </div>
                    </div>

                  
                </div>
              </Dialog>
        </div>
    )
}
