import { DialogBody } from "@material-tailwind/react"
import { useEffect, useRef, useState } from "react"
import { MdImage, MdClose, MdAttachFile } from "react-icons/md"
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
    const [users, setUsers] = useState([])
    const [openUploadModal, setOpenUploadModal] = useState(false)


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
        const response = await sendSingleMessage({ roomId: taskSubTaskId.subTaskId, sender: userData._id, message: singleMessage })
        if (response?.status) {
            setSocketMessage({ ...response.data, user: userData.email,taskId:taskSubTaskId.taskId })
            setMessages(previous => [...previous, { ...response.data, user: userData.email }])
            setSingleMessage("")
        }
    }


    const uploadModalHandler = () => setOpenUploadModal(previous => !previous)

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
                <MdImage onClick={setOpenUploadModal} className="w-5 h-5" />
                <InputEmoji ref={textAreaRef} onChange={setSingleMessage} value={singleMessage} cleanOnEnter onEnter={send} maxLength={2000} shouldReturn placeholder="Type something" />
                <MdAttachFile className="w-5 h-5 rotate-45" />
            </div>

            {/* Image Upload */}
            {/* <Dialog open={openUploadModal} handler={uploadModalHandler} size="xs" className="outline-none">
                <input onChange={imageLoad} type="file" />
                
                <img src={image} />
                
            </Dialog> */}
        </div>
    )
}
