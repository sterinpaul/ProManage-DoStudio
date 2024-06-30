import { Button, Dialog, DialogBody } from "@material-tailwind/react"
import { useEffect, useRef, useState } from "react"
import { MdImage, MdClose, MdAttachFile } from "react-icons/md"
import { CiCircleRemove } from "react-icons/ci"
import { getSubTaskChatMessages, readChatUpdation, sendSingleMessage, sendSingleFile, getBlobFileDownload } from "../../api/apiConnections/chatConnections"
import InputEmoji from "react-input-emoji"
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil"
import { userDataAtom } from "../../recoil/atoms/userAtoms"
import { toast } from "react-toastify"
import { currentProjectAtom, taskSubTaskAtom } from "../../recoil/atoms/projectAtoms"
import { allChatMessageAtom, socketMessageAtom } from "../../recoil/atoms/chatAtoms"
import { SingleChat } from "./SingleChat"
import {LoadingSpinner} from "../Home/LoadingSpinner"


export const SubTaskChat = ({ subTaskChatModalHandler }) => {
    const userData = useRecoilValue(userDataAtom)
    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const [taskSubTaskId, setTaskSubTaskId] = useRecoilState(taskSubTaskAtom)
    const [messages, setMessages] = useRecoilState(allChatMessageAtom)
    const [singleMessage, setSingleMessage] = useState("")
    const setSocketMessage = useSetRecoilState(socketMessageAtom)
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [fileUpload, setFileUpload] = useState(null)
    const [uploadType, setUploadType] = useState("")
    const [loading, setLoading] = useState(false)
    const [uploadResponse, setUploadResponse] = useState("")
    
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
        return () => {
            setMessages([])
            setTaskSubTaskId({ taskId: "", subTaskId: "" })
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
            setSocketMessage({ ...response.data, user: userData.email, taskId: taskSubTaskId.taskId })
            setMessages(previous => [...previous, { ...response.data, user: userData.email }])
            setSingleMessage("")
        }
    }

    const sendFile = async () => {
        setLoading(true)
        const response = await sendSingleFile(taskSubTaskId.subTaskId, userData._id, uploadType, fileUpload)
        setLoading(false)
        setFileUpload(null)
        if (response?.status) {
            setSocketMessage({ ...response.data, user: userData.email, taskId: taskSubTaskId.taskId })
            setMessages(previous => [...previous, { ...response.data, user: userData.email }])
            setUploadResponse("Upload success")
        } else {
            setUploadResponse("Upload failed")
        }

        setTimeout(() => {
            setUploadResponse("")
        }, 4000)
    }


    const uploadModalHandler = (fileType = "") => {
        if (openUploadModal && fileUpload) {
            setFileUpload(null)
        }
        setUploadType(fileType)
        setOpenUploadModal(previous => !previous)
    }

    const downloadFile = async (fileUrl, fileName) => {
        const response = await getBlobFileDownload(fileUrl)
        const blob = new Blob([response], { type: response.type })
        const url = window.URL.createObjectURL(blob);
    
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }

    return (
        <div className="relative w-full max-h-sreen flex flex-col justify-between">
            <div onClick={subTaskChatModalHandler} className="absolute z-10 group cursor-pointer right-2 top-2 rounded-full p-1 transition hover:bg-black bg-blue-gray-100 ">
                <MdClose className="w-4 h-4 transition text-black group-hover:text-white" />
            </div>
            <DialogBody>
                <div className="flex w-full h-[calc(100vh-10rem)] overflow-y-scroll mt-6 flex-col items-center gap-2 rounded border border-gray-900/10 bg-gray-900/5 p-2">
                    {messages?.length ? messages.map((singleMessage, index) => {
                        return (
                            <SingleChat key={singleMessage._id} index={index} chatCount={messages.length - 1} singleMessage={singleMessage} userId={userData._id} chatRef={chatRef} downloadFile={downloadFile} />
                        )
                    }) : <div className="flex items-center justify-center w-full h-96"><p>No Messages</p></div>}
                </div>
            </DialogBody>
            <div className="flex flex-nowrap justify-center items-center px-4 mb-4">

                <div onClick={() => uploadModalHandler("image")} className="cursor-pointer p-1 border rounded-full hover:shadow-lg bg-gray-100 group">
                    <MdImage className="w-5 h-5 group-hover:text-blue-500" />
                </div>

                <InputEmoji ref={textAreaRef} onChange={setSingleMessage} value={singleMessage} cleanOnEnter onEnter={send} maxLength={2000} shouldReturn placeholder="Type something" />

                <div onClick={() => uploadModalHandler("file")} className="cursor-pointer p-1 border rounded-full hover:shadow-lg bg-gray-100 group">
                    <MdAttachFile className="w-5 h-5 rotate-45 group-hover:text-blue-500" />
                </div>

            </div>

            {/* Image or File Upload */}
            <Dialog open={openUploadModal} handler={uploadModalHandler} dismiss={{ escapeKey: false, outsidePress: false }} size="xs" className="outline-none" >

                <div className="m-4 flex flex-col justify-center items-center">

                    <div className="flex flex-col justify-center items-center">
                        {fileUpload ? (
                            <div className="relative">
                                {uploadType === "image" ? (
                                    <>
                                        <img className="max-h-96" src={fileUpload && URL.createObjectURL(fileUpload)} />
                                        <div onClick={() => setFileUpload(null)} className="absolute cursor-pointer group top-0 flex justify-center items-center w-full h-full bg-opacity-0 hover:bg-opacity-50 bg-blue-gray-500">
                                            <CiCircleRemove className="w-12 h-12 hidden group-hover:block text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-20 w-60 flex items-center justify-center">
                                        <p className="text-center text-wrap whitespace-nowrap overflow-hidden overflow-ellipsis">{fileUpload.name}</p>
                                    </div>
                                )}
                                {loading && <div className="absolute top-0 flex justify-center items-center w-full h-full bg-white"><LoadingSpinner /></div>}
                            </div>
                        ) : <><label className=" bg-blue-500 hover:bg-blue-600 text-white text-center py-1 px-2 rounded cursor-pointer text-nowrap">Choose {uploadType}
                            <input className="hidden" onChange={(e) => setFileUpload(e.target?.files?.[0])} name='file' type="file" accept={uploadType === "image" ? ".jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.svg,.webp,.heic" : "application/*,audio/*,video/*,text/*"} />
                        </label>
                            {uploadType === "image" && <p className="h-5 text-wrap text-center px-2">Allowed formats: jpg, jpeg, png, gif, etc</p>}</>}

                        {uploadResponse && <p className="text-center text-blue-700">{uploadResponse}</p>}

                        <div className="flex gap-4 mt-2">
                            {!loading && <Button onClick={sendFile} disabled={fileUpload ? false : true} color="blue" className="w-24 py-2">Send</Button>}
                            <Button onClick={uploadModalHandler} color="black" className="w-24 py-2 hover:bg-gray-800">Cancel</Button>
                        </div>
                    </div>


                </div>
            </Dialog>
        </div>
    )
}
