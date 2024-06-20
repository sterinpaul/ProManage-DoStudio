// import { Card, Typography  } from "antd"
import { SubTask } from "./SubTask"
import { BiPlus } from "react-icons/bi"
import { MdDeleteOutline } from "react-icons/md"
import { Button, Typography, Card, CardBody, CardHeader, Dialog, DialogBody, DialogFooter } from "@material-tailwind/react"
import { useState } from "react"
import { toast } from "react-toastify"
import { removeSubTasks } from "../../api/apiConnections/projectConnections"
import { currentProjectAtom } from "../../recoil/atoms/projectAtoms"
import { useSetRecoilState } from "recoil"


const tableCol = ["Task", "Status", "Due Date", "Priority", "Notes", "People"]
const statusGroup = [
    {
        value: "not started",
        color: "gray-500"
    }, {
        value: "in progress",
        color: "blue-500"
    }, {
        value: "on hold",
        color: "pink-500"
    }, {
        value: "done",
        color: "green-500"
    }
]
const priorityGroup = [
    {
        value: "normal",
        color: "blue-500"
    }, {
        value: "critical", 
        color: "red-500"
    }
]

export const TaskTable = ({ singleTable, addSubTask, dueDateChanger, classes, selectSubTaskChat, isAdmin,dueDatePermitted,priorityPermitted,peoplePermitted }) => {
    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const [selectedSubTasks,setSelectedSubTasks] = useState([])
    const [openRemoveDialog,setOpenRemoveDialog] = useState(false)

    const allSubTaskSelectionHandler = (event)=>{
        if(event.target.checked){
            setSelectedSubTasks(singleTable?.subTasks?.map(eachTask=>eachTask._id))
        }else{
            setSelectedSubTasks([])
        }
    }

    const singleSubTaskSelectionhandler = (checked,subTaskId)=>{
        if(checked){
            setSelectedSubTasks(previous=>[...previous,subTaskId])
        }else{
            setSelectedSubTasks(previous=>previous.filter(singleTask=>singleTask !== subTaskId))
        }
    }

    const removeSubTaskHandler = ()=>{
        setOpenRemoveDialog(previous=>!previous)
    }

    const removeSubTask = async()=>{
        const removeResponse = await removeSubTasks(selectedSubTasks)
        if(removeResponse?.status){
            setSelectedProject(previous=>previous.map(task=>{
                if(task._id === singleTable._id){
                    const updated = task.subTasks.filter(subTask=>!selectedSubTasks.includes(subTask._id))
                    return {...task,subTasks:updated}
                }else{
                    return task
                }
            }))

            setSelectedSubTasks([])
            removeSubTaskHandler()
            toast.success(removeResponse.message)
        }
    }


    return (
        <Card className="h-full w-full">
            <CardHeader floated={false} shadow={false} className="rounded-none">
                <Typography className="capitalize" variant="h5" color="blue-gray">
                {singleTable.name}
                </Typography>
                <Typography variant="h6" color="blue-gray">
                {singleTable.description}
                </Typography>
            </CardHeader>
            <CardBody className="overflow-x-scroll px-1">
                <table className="w-full min-w-max table-auto rounded-lg">
                    <thead>
                        <tr className="h-8">
                            <th className={`${classes}`} >
                                <div className="flex items-center justify-center gap-1">
                                    {isAdmin ? singleTable?.subTasks?.length ? <input onChange={allSubTaskSelectionHandler} type="checkbox" className="w-3 h-3 rounded cursor-pointer" /> : null : "No."}
                                    {selectedSubTasks?.length ? <>
                                        <MdDeleteOutline onClick={removeSubTaskHandler} className="w-4 h-4 text-red-600 cursor-pointer" />
                                        <Dialog open={openRemoveDialog} handler={removeSubTaskHandler} size="xs" className="text-center" >
                                            <DialogBody>
                                                <Typography variant="h4" className="pt-4 px-8" >
                                                    Are you sure want to remove the sub task ?
                                                </Typography>
                                            </DialogBody>
                                            <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
                                                <Button onClick={removeSubTask} color="black" className="w-24 py-2">Ok</Button>
                                                <Button onClick={removeSubTaskHandler} color="red" className="w-24 py-2">Cancel</Button>
                                            </DialogFooter>
                                        </Dialog>
                                    </> : null}
                                </div>
                            </th>
                            {tableCol?.map((singleHeader, index) => (
                                <th key={index} className={classes} colSpan={index === 0 ? 2 : 1} >{singleHeader}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {singleTable?.subTasks?.map((subTask,index) => {
                            return (
                                <SubTask 
                                    key={subTask._id}
                                    index={index}
                                    subTask={subTask}
                                    taskId={singleTable._id}
                                    classes={classes} 
                                    statusGroup={statusGroup} 
                                    priorityGroup={priorityGroup}
                                    dueDateChanger={dueDateChanger}
                                    selectedSubTasks={selectedSubTasks}
                                    singleSubTaskSelectionhandler={singleSubTaskSelectionhandler}
                                    selectSubTaskChat={selectSubTaskChat}
                                    isAdmin={isAdmin}
                                    dueDatePermitted={dueDatePermitted}
                                    priorityPermitted={priorityPermitted}
                                    peoplePermitted={peoplePermitted}
                                />
                            )
                        })}
                        <tr className="h-8 group">
                            <td onClick={()=>addSubTask(singleTable._id)} className={`${classes} cursor-pointer`}>
                                <BiPlus className="w-5 h-5 mx-auto group-hover:scale-150 transition delay-100 group-hover:rotate-90"/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardBody>
        </Card>
    )
}

