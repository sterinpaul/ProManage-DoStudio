import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client'
import { metaicon } from '../../assets'
import { currentProjectAtom, taskSubTaskAtom } from '../../recoil/atoms/projectAtoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { toast } from 'react-toastify';
import { configKeys } from '../../api/config';
import { allChatMessageAtom, assignNotifyAtom, socketMessageAtom } from '../../recoil/atoms/chatAtoms';


const Topbar = () => {
  const socket = useRef(null)
  const socketMessage = useRecoilValue(socketMessageAtom)
  const assignNotification = useRecoilValue(assignNotifyAtom)
  const setSelectedProject = useSetRecoilState(currentProjectAtom)
  const taskSubTaskId = useRecoilValue(taskSubTaskAtom)
  const setMessages = useSetRecoilState(allChatMessageAtom)

  useEffect(() => {
    socket.current = io(configKeys.SOCKET_URL)

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [])

  useEffect(() => {
    if (socket.current) {
      socket.current.on("chatMessage", (msg) => {
        const { taskId,...data } = msg;
        console.log("taskSubTaskId",taskSubTaskId,'data',data);
        if (data.roomId == taskSubTaskId?.subTaskId) {
          setMessages(previous => [...previous, data]);
          setSelectedProject(previous=>previous.map(task=>task._id === taskId ? {...task,subTasks:task.subTasks.map(subTask=>subTask._id === data.roomId ? {...subTask,chatUnreadCount:0} : subTask)} : task))
        }else{
          setSelectedProject(previous=>previous.map(task=>task._id === taskId ? {...task,subTasks:task.subTasks.map(subTask=>subTask._id === data.roomId ? {...subTask,chatUnreadCount:subTask.chatUnreadCount+1} : subTask)} : task))
        }
      })
    }
  }, [taskSubTaskId])

  useEffect(()=>{
    if(socket.current){
      socket.current.on("task-assigned",(data)=>{
        toast.success(`Task assigned by ${data.assigner} to ${data.assignee}`)
      })
    }
  },[])

  useEffect(() => {
    if (socket.current) {
      if(socketMessage?._id){
        socket.current.emit('chatMessage', socketMessage);
      }
    }
  },[socketMessage])

  useEffect(() => {
    if (socket.current) {
      if(assignNotification?.assigner){
        socket.current.emit("task-assigned",assignNotification)
      }
    }
  },[assignNotification])

  return (
    <div className='p-3 bg-gray-200 fixed top-0 z-50 w-full flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <img className='h-7 w-7 object-cover' src={metaicon} alt="" />
        <h1 className='text-base font-normal'><span className='capitalize font-bold'>dostudio</span> work management</h1>
      </div>
    </div>
  )
}

export default Topbar