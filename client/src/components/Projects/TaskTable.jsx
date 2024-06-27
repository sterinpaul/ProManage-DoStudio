import { SubTask } from "./SubTask"
import { BiPlus, BiChevronDownCircle, BiDotsVerticalRounded } from "react-icons/bi"
import { MdDeleteOutline } from "react-icons/md"
import { Button, Typography, Card, CardBody, Dialog, DialogBody, DialogFooter, Popover, PopoverHandler, PopoverContent, ListItem, List } from "@material-tailwind/react"
import { useEffect, useState, useCallback } from "react"
import { toast } from "react-toastify"
import { removeSubTasks } from "../../api/apiConnections/projectConnections"
import { currentProjectAtom } from "../../recoil/atoms/projectAtoms"
import { useSetRecoilState } from "recoil"
import moment from "moment"
import { OptionsConsolidationComp } from "./elements/OptionsConsolidationComp"
import { Avatar } from "antd"


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

export const TaskTable = ({ singleTable, addSubTask, dueDateChanger, classes, subTaskChatModalHandler, isAdmin, dueDatePermitted, priorityPermitted, peoplePermitted, removeTaskModalOpen }) => {
    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const [selectedSubTasks, setSelectedSubTasks] = useState([])
    const [openRemoveDialog, setOpenRemoveDialog] = useState(false)
    const [openTaskTable, setOpenTaskTable] = useState(true)
    const [taskStatus, setTaskStatus] = useState([])
    const [taskPriority, setTaskPriority] = useState([])
    const [taskDue, setTaskDue] = useState("")


    const allSubTaskSelectionHandler = (event) => {
        if (event.target.checked) {
            setSelectedSubTasks(singleTable?.subTasks?.map(eachTask => eachTask._id))
        } else {
            setSelectedSubTasks([])
        }
    }

    const singleSubTaskSelectionhandler = (checked, subTaskId) => {
        if (checked) {
            setSelectedSubTasks(previous => [...previous, subTaskId])
        } else {
            setSelectedSubTasks(previous => previous.filter(singleTask => singleTask !== subTaskId))
        }
    }

    const removeSubTaskHandler = () => {
        setOpenRemoveDialog(previous => !previous)
    }

    const removeSubTask = async () => {
        const removeResponse = await removeSubTasks(selectedSubTasks)
        if (removeResponse?.status) {
            setSelectedProject(previous => previous.map(task => {
                if (task._id === singleTable._id) {
                    const updated = task.subTasks.filter(subTask => !selectedSubTasks.includes(subTask._id))
                    return { ...task, subTasks: updated }
                } else {
                    return task
                }
            }))

            setSelectedSubTasks([])
            removeSubTaskHandler()
            toast.success(removeResponse.message)
        }
    }


    const consolidationHandler = useCallback(() => {
        const taskArr = singleTable?.subTasks?.map(subTask => subTask.status)
        const taskMap = new Map()
        taskArr.forEach(each => {
            if (taskMap.has(each)) {
                taskMap.set(each, taskMap.get(each) + 1)
            } else {
                taskMap.set(each, 1)
            }
        })
        const updatedTaskArr = []
        taskMap.forEach((value, key) => {
            updatedTaskArr.push({ label: key, count: value })
        })
        setTaskStatus(updatedTaskArr)

        const priorityArr = singleTable?.subTasks?.map(subTask => subTask.priority)
        const priorityMap = new Map()
        priorityArr.forEach(each => {
            if (priorityMap.has(each)) {
                priorityMap.set(each, priorityMap.get(each) + 1)
            } else {
                priorityMap.set(each, 1)
            }
        })
        const updatePrioritydArr = []
        priorityMap.forEach((value, key) => {
            updatePrioritydArr.push({ label: key, count: value })
        })
        setTaskPriority(updatePrioritydArr)

        const dueDateArray = singleTable?.subTasks?.map(subTask => subTask.dueDate).filter(each => each !== "").sort((date1, date2) => {
            let d1 = new Date(date1);
            let d2 = new Date(date2);
            return d1 - d2
        })

        if (dueDateArray.length) {
            const startD = new Date(dueDateArray[0])
            const endD = new Date(dueDateArray[dueDateArray.length - 1])
            if (moment(startD).format("DD MMM") == moment(endD).format("DD MMM")) {
                setTaskDue(moment(endD).format("DD MMM"))
            } else if (startD.getMonth() == endD.getMonth()) {
                setTaskDue(`${moment(startD).format("DD")} - ${moment(endD).format("DD MMM")}`)
            } else {
                setTaskDue(`${moment(startD).format("DD MMM")} - ${moment(endD).format("DD MMM")}`)
            }
        }
    }, [singleTable?.subTasks])

    const openTaskTableHandler = () => setOpenTaskTable(previous => !previous)

    useEffect(() => {
        consolidationHandler()
    }, [consolidationHandler])

    return (
        <Card className="h-full w-full shadow-none border">
            <div className="flex">
                <div className="flex gap-2 m-2 mx-2">
                    <div className="flex flex-col  h-12 gap-1 mt-1 items-center">
                        <BiChevronDownCircle onClick={openTaskTableHandler} className="cursor-pointer w-5 h-5" />

                        {openTaskTable && <div className="relative group">
                            <BiDotsVerticalRounded className="cursor-pointer w-5 h-5" />

                            <div className="absolute bg-white hidden group-hover:flex flex-col justify-center items-center border z-10 p-1 shadow-lg rounded w-20 max-w-52">
                                <div className="w-full cursor-pointer">
                                    {isAdmin && <p onClick={() => removeTaskModalOpen(singleTable._id)} className="p-1 pl-2 text-sm hover:bg-gray-200 rounded">Remove</p>}
                                    <p className="p-1 pl-2 text-sm hover:bg-gray-200 rounded">Export</p>
                                </div>
                            </div>
                        </div>}
                    </div>
                    <div className={`${!openTaskTable && "min-w-[17.5rem] w-[17.5rem]"}`}>
                        <Typography className="capitalize relative" variant="h5" color="blue-gray">
                            {singleTable.name}
                            {openTaskTable && <p className="absolute -right-12 top-0 text-xs font-light text-gray-500">{`${singleTable?.subTasks?.length && singleTable.subTasks.length === 1 ? "1 Task" : singleTable.subTasks.length + " Tasks"}`}</p>}
                        </Typography>
                        {openTaskTable ? <p>
                            {singleTable.description}
                        </p> : <p className="mb-2">{`${singleTable?.subTasks?.length && singleTable.subTasks.length === 1 ? "1 Task" : singleTable.subTasks.length + " Tasks"}`}</p>}
                    </div>
                </div>
                {!openTaskTable && (
                    <div className="overflow-x-scroll w-full no-scrollbar mr-2 border-l">
                        <table className="w-full min-w-max h-full table-auto rounded-lg">
                            <thead>
                                <tr className="align-middle">
                                    <th className="w-36 border-l pt-2">Status</th>
                                    <th className="w-36 border-l pt-2">Due Date</th>
                                    <th className="w-36 border-l pt-2">Priority</th>
                                    <th className="min-w-48 border-l"></th>
                                    <th className="border-l pt-2">People</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border-l p-0">
                                        <div className="h-full flex p-1">
                                            {taskStatus?.map((eachOption, index) =>
                                            (
                                                <OptionsConsolidationComp key={index} index={index} taskCount={singleTable?.subTasks?.length} eachOption={eachOption} optionGroup={statusGroup} />
                                            )
                                            )}
                                        </div>
                                    </td>
                                    <td className="border-l px-1">
                                        {taskDue && <div className="flex p-1.5 cursor-default justify-center text-center rounded-full bg-blue-500 text-white">
                                            {taskDue}
                                        </div>}
                                    </td>
                                    <td className="border-l p-0">
                                        <div className="h-full flex p-1">
                                            {taskPriority?.map((eachOption, index) =>
                                            (
                                                <OptionsConsolidationComp key={index} index={index} taskCount={singleTable?.subTasks?.length} eachOption={eachOption} optionGroup={priorityGroup} />
                                            )
                                            )}
                                        </div>
                                    </td>
                                    <td className="border-l">
                                        <div className="w-44 xl:w-52 2xl:w-96"></div>
                                    </td>
                                    <td className="border-l">
                                        <div className="w-fit m-auto -space-x-4 relative">
                                            {singleTable?.subTasks?.length > 2 ? (
                                                <>
                                                    <Avatar className="w-8 h-8 border border-blue-500 hover:z-10 focus:z-10" src={singleTable?.subTasks[0]?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                                    <Avatar className="w-8 h-8 border border-blue-500 hover:z-10 focus:z-10" src={singleTable?.subTasks[1]?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                                    <div className="absolute -right-3 top-2 text-xs text-black"> +{singleTable?.subTasks.length - 2}</div>
                                                </>
                                            ) : singleTable?.subTasks?.map((subTask, index) => (
                                                <Avatar key={index} className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10" src={subTask?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {openTaskTable ? <CardBody className="overflow-x-scroll px-2 py-2">
                <table className="w-full min-w-max table-auto rounded-lg">
                    <thead>
                        <tr className="h-8">
                            <th className={`${classes}`} >
                                <div className="flex items-center justify-center gap-1">
                                    {isAdmin ? singleTable?.subTasks?.length ? <input onChange={allSubTaskSelectionHandler} type="checkbox" className="w-3 h-3 rounded cursor-pointer" /> : null : "No."}
                                    {selectedSubTasks?.length ? <>
                                        <MdDeleteOutline onClick={removeSubTaskHandler} className="w-4 h-4 text-red-600 cursor-pointer" />
                                        <Dialog open={openRemoveDialog} handler={removeSubTaskHandler} size="xs" className="text-center outline-none" >
                                            <DialogBody>
                                                <Typography variant="h4" className="pt-4 px-8" >
                                                    Are you sure want to remove the sub task ?
                                                </Typography>
                                            </DialogBody>
                                            <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
                                                <Button onClick={removeSubTask} color="red" className="w-24 py-2">Yes</Button>
                                                <Button onClick={removeSubTaskHandler} color="black" className="w-24 py-2">Cancel</Button>
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
                        {singleTable?.subTasks?.map((subTask, index) => {
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
                                    subTaskChatModalHandler={subTaskChatModalHandler}
                                    isAdmin={isAdmin}
                                    dueDatePermitted={dueDatePermitted}
                                    priorityPermitted={priorityPermitted}
                                    peoplePermitted={peoplePermitted}
                                />
                            )
                        })}
                        <tr className="h-8">
                            <td onClick={() => addSubTask(singleTable._id)} className={`${classes} group cursor-pointer`}>
                                <BiPlus className="w-5 h-5 mx-auto group-hover:scale-150 transition delay-100 group-hover:rotate-90" />
                            </td>
                            <td colSpan={2} className={`${classes}`}></td>
                            <td className={`${classes} p-0`}>
                                <div className="h-full text-white flex">.
                                    {taskStatus?.map((eachOption, index) =>
                                    (
                                        <OptionsConsolidationComp key={index} index={index} taskCount={singleTable?.subTasks?.length} eachOption={eachOption} optionGroup={statusGroup} />
                                        
                                    )
                                    )}
                                .</div>
                            </td>
                            <td className={`${classes} px-1`}>
                                {taskDue && <div className="flex p-0.5 cursor-default justify-center text-center rounded-full bg-blue-500 text-white">
                                    {taskDue}
                                </div>}
                            </td>
                            <td className={`${classes} p-0`}>
                                <div className="h-full text-white flex">.
                                    {taskPriority?.map((eachOption, index) =>
                                    (
                                        <OptionsConsolidationComp key={index} index={index} taskCount={singleTable?.subTasks?.length} eachOption={eachOption} optionGroup={priorityGroup} />
                                    )
                                    )}
                                .</div>
                            </td>
                            <td className={`${classes}`}></td>
                            <td className={`${classes}`}>
                                <div className="w-fit m-auto -space-x-4 relative">
                                    {singleTable?.subTasks?.length > 2 ? (
                                        <>
                                            <Avatar className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10" src={singleTable?.subTasks[0]?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                            <Avatar className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10" src={singleTable?.subTasks[1]?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                            <div className="absolute -right-3 top-1 text-xs text-black"> +{singleTable?.subTasks.length - 2}</div>
                                        </>
                                    ) : singleTable?.subTasks?.map((subTask, index) => (
                                        <Avatar key={index} className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10" src={subTask?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                                    ))}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </CardBody> : null
            }
        </Card>
    )
}

