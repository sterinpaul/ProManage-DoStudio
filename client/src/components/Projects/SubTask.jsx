import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import dayjs from 'dayjs'
import { DatePicker,Space } from 'antd';
import { Avatar, Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";
import moment from 'moment';
import { useState } from "react";
import { SelectComponent } from "./elements/SelectComponent";
import { MdEdit } from "react-icons/md";
import { InputComponent } from "../Home/InputComponent";
import { toast } from "react-toastify";
import { subTaskToPerson, updatePriority, updateStatus, updateSubTaskName, updateSubTaskNote } from "../../api/apiConnections/projectConnections";
import { useSetRecoilState } from "recoil";
import { currentProjectAtom } from "../../recoil/atoms/projectAtoms";
import { TextAreaComponent } from "../Home/TextAreaComponent";
import { getUsersForAssignSubTask } from "../../api/apiConnections/userConnections";


export const SubTask = ({ index,
    subTask,
    taskId,
    classes,
    statusGroup,
    priorityGroup,
    dueDateChanger,
    selectedSubTasks,
    singleSubTaskSelectionhandler,
    selectSubTaskChat,
    isAdmin,
    dueDatePermitted,
    priorityPermitted,
    peoplePermitted
}) => {

    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const [selectedDate, setSelectedDate] = useState(subTask.dueDate ? dayjs(subTask.dueDate) : null)
    const checkboxSelected = selectedSubTasks?.includes(subTask?._id)
    const [editToggle,setEditToggle] = useState(false)
    const [editNotesToggle,setEditNotesToggle] = useState(false)
    const [nameError, setNameError] = useState(false)
    const [notesError, setNotesError] = useState(false)
    const [subTaskName, setSubTaskName] = useState(subTask?.name)
    const [subTaskNotes, setSubTaskNotes] = useState(subTask?.notes)
    const [usersForAssign, setUsersForAssign] = useState([])
    const [openPopoverHover, setOpenPopoverHover] = useState(false);
    const[openPeopleModal,setOpenPeopleModal] = useState(false)


    const peopleModalhandler = async()=>{
        if(peoplePermitted || isAdmin){
            if(!openPeopleModal){
                const response = await getUsersForAssignSubTask()
                if(response?.status){
                    setUsersForAssign(response.data)
                }
            }
            setOpenPeopleModal(previous=>!previous)
        }
    }

    const assignPerson = async(userData)=>{
        const response = await subTaskToPerson(subTask._id,userData._id)
        if(response.status){
            setSelectedProject(previous=>previous.map(task=>task._id === taskId ? {...task,subTasks:task.subTasks.map(subTasks=>subTask._id === subTasks._id ? {...subTasks,peopleName:userData.email,peopleImg:userData.profilePhotoURL} : subTasks)} : task))
            setOpenPeopleModal(previous=>!previous)
        }
    }

    const triggers = {
      onMouseEnter: () => setOpenPopoverHover(true),
      onMouseLeave: () => setOpenPopoverHover(false),
    };    

    const disabledDate = (current) => {
        return current && current < moment().endOf("day")
    }

    const dateChange = (date)=> {
        setSelectedDate(date)
        dueDateChanger(subTask._id,date)
    }

    const selectSubTask = (event)=>{
        singleSubTaskSelectionhandler(event.target.checked,subTask._id)
    }

    const openEditNameInput = ()=>{
        setEditToggle(!editToggle)
    }

    const openEditNotesInput = ()=>{
        setEditNotesToggle(!editNotesToggle)
    }

    const updateName = async(event)=>{
        event.preventDefault()
        openEditNameInput()
        if(subTaskName.trim().length){
            setNameError(false)
            if(subTask.name !== subTaskName){
                const response = await updateSubTaskName(subTask._id,subTaskName)
                if(response?.status){
                    setSelectedProject(previous=>previous.map(task=>task._id === taskId ? {...task,subTasks:task.subTasks.map(subTasks=>subTask._id === subTasks._id ? {...subTasks,name:subTaskName} : subTasks)} : task))
                    setEditToggle(false)
                }else{
                    toast.error(response.message)
                }
            }
        }else{
          setNameError(true)
        }
      }
    const updateNotes = async(event)=>{
        event.preventDefault()
        openEditNotesInput()
        if(subTaskNotes.trim().length){
            setNotesError(false)
            if(subTask.notes !== subTaskNotes){
                const response = await updateSubTaskNote(subTask._id,subTaskNotes)
                if(response?.status){
                    setSelectedProject(previous=>previous.map(task=>task._id === taskId ? {...task,subTasks:task.subTasks.map(subTasks=>subTask._id === subTasks._id ? {...subTasks,notes:subTaskNotes} : subTasks)} : task))
                    setEditNotesToggle(false)
                }else{
                    toast.error(response.message)
                }
            }
        }else{
          setNotesError(true)
        }
      }

      const updateSubTaskOption = async(headerType,option)=>{
        if(headerType === "status"){
            const response = await updateStatus(subTask._id,option)
            if(!response?.status){
                toast.error(response.message) 
            }
        }else
        if(headerType === "priority"){
            const response = await updatePriority(subTask._id,option)
            if(!response?.status){
                toast.error(response.message) 
            }
        }
      }

    return (
        <tr className="even:bg-blue-gray-50 odd:bg-gray-100 hover:bg-white">

            <td className={`${classes} text-center w-14`}>
                {isAdmin ? <input checked={checkboxSelected} onChange={selectSubTask} type="checkbox" className="w-3 h-3 rounded cursor-pointer" /> : <p>{index+1}</p>}
            </td>

            <td className={`${nameError && "outline-2 outline-dashed outline-red-600"} ${classes} relative w-44 group cursor-pointer`}>
                {editToggle ? <InputComponent subTaskName={subTaskName} setSubTaskName={setSubTaskName} updateName={updateName} /> :
                <>
                    <p className="capitalize">{subTaskName}</p>
                    <MdEdit onClick={openEditNameInput} className="absolute hidden right-0 top-2 group-hover:block w-4 h-4" />
                </>}
            </td>

            <td onClick={()=>selectSubTaskChat(subTask._id)} className={`${classes} cursor-pointer`}>
                <div className="flex justify-center items-center">
                    <HiOutlineChatBubbleOvalLeft className="w-5 h-5" />
                </div>
            </td>
            
            <SelectComponent currentValue={subTask.status} valueGroup={statusGroup} updateSubTaskOption={updateSubTaskOption} headerType={"status"} classes={classes} isAdmin={true} permission={true} />
            
            <td className={`${classes} text-center w-32`}>
                <Space direction="vertical">
                    <DatePicker
                        size="small"
                        disabled={!dueDatePermitted && !isAdmin}
                        onChange={dateChange}
                        allowClear={false}
                        className="px-0 border-none bg-transparent outline-none"
                        format="DD-MMM-YYYY"
                        defaultValue={selectedDate}
                        disabledDate={disabledDate}
                    />
                </Space>
            </td>

            <SelectComponent currentValue={subTask.priority} valueGroup={priorityGroup} updateSubTaskOption={updateSubTaskOption} headerType={"priority"} classes={classes} isAdmin={isAdmin} permission={priorityPermitted} />
            
            <td className={`${notesError && "outline-2 outline-dashed outline-red-600"} ${classes} relative w-44 group cursor-pointer`}>
                {editNotesToggle ? <TextAreaComponent subTaskNotes={subTaskNotes} setSubTaskNotes={setSubTaskNotes} updateNotes={updateNotes} /> :
                <div className="w-44">
                    <Popover open={openPopoverHover} handler={setOpenPopoverHover}>
                        <PopoverHandler {...triggers}>
                            <p className="whitespace-nowrap overflow-hidden overflow-ellipsis">{subTaskNotes}</p>
                        </PopoverHandler>
                        <PopoverContent {...triggers} className="max-w-52 overflow-y-scroll">
                            {subTaskNotes}
                        </PopoverContent>
                    </Popover>
                    <MdEdit onClick={openEditNotesInput} className="absolute hidden right-0 top-2 group-hover:block w-4 h-4" />
                </div>
                }
            </td>

            <td className={`${classes} text-center`}>
                <Popover open={openPeopleModal} handler={peopleModalhandler} dismiss={{ancestorScroll:false}} placement="top-end" >
                    <PopoverHandler>
                        {subTask?.peopleName ? <div className="relative group">
                                <Avatar className="w-8 h-8 cursor-pointer" src={subTask?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                <p className="absolute hidden group-hover:block -top-7 right-0 px-2 shadow-xl border bg-white rounded-full ">{subTask?.peopleName?.split("@")[0]}</p>
                            </div>
                        : (
                            <Avatar className="w-8 h-8 cursor-pointer" src={subTask?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                        )}
                    </PopoverHandler>
                    <PopoverContent>
                        <div className="flex flex-wrap gap-1 z-10">
                            {usersForAssign?.length ? usersForAssign.map(user=>{
                                const userId = user.email.split("@")[0]
                                return(
                                    <div key={user._id} className="relative group">
                                        <Avatar onClick={()=>assignPerson(user)} className="w-8 h-8 cursor-pointer border" src={user?.profilePhotoURL ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                        <p className="absolute hidden group-hover:block -top-6 right-0 px-2 shadow-xl border bg-white rounded-full ">{userId}</p>
                                    </div>
                                )
                            }) : null}
                        </div>
                    </PopoverContent>
                </Popover>
            </td>

        </tr>
    )
}