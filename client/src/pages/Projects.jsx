import { BiPlus, BiSearchAlt2, BiFilterAlt, BiSort } from "react-icons/bi"
import { TaskTable } from "../components/Projects/TaskTable";
import { Button, Dialog, DialogBody, DialogFooter, Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { addSingleSubTask, dueDateUpdate, getSingleProject, removeATask } from "../api/apiConnections/projectConnections";
import { currentProjectAtom } from "../recoil/atoms/projectAtoms";
import { FormComponent } from "../components/Home/FormComponent";
import { toast } from "react-toastify";
import { SubTaskChat } from "../components/Chat/SubTaskChat";
import { configKeys } from "../api/config";
import { userDataAtom } from "../recoil/atoms/userAtoms";


const Projects = () => {
  const { state } = useLocation()
  const userData = useRecoilValue(userDataAtom)
  const [selectedProject, setSelectedProject] = useRecoilState(currentProjectAtom)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [openChat, setOpenChat] = useState(false)
  const isAdmin = userData?.role === configKeys.ADMIN_ROLE ? true : false;
  const projectPermitted = userData?.permissions?.find(project => project?.projectId === state.id)
  const dueDatePermitted = projectPermitted?.allowedPermissions?.includes("dueDate") ?? false
  const priorityPermitted = projectPermitted?.allowedPermissions?.includes("priority") ?? false
  const peoplePermitted = projectPermitted?.allowedPermissions?.includes("people") ?? false
  const [openRemoveTaskModal, setOpenRemoveTaskModal] = useState(false)
  const [taskId, setTaskId] = useState("")
  const classes = "border border-blue-gray-200"


  const getSelectedProject = async () => {
    const response = await getSingleProject(state?.id)
    if (response?.status) {
      setSelectedProject(response.data)
    }
  }

  useEffect(() => {
    getSelectedProject()
    return () => setSelectedProject([])
  }, [state])


  const formHandler = () => {
    setIsFormOpen(!isFormOpen)
  }

  const addSubTask = async (taskId) => {
    const selectedTask = selectedProject?.find(task => task._id === taskId)
    const lastSubTaskExists = selectedTask?.subTasks?.slice(-1)[0]?.name.length
    const subTasksExist = selectedTask.subTasks?.length

    if (lastSubTaskExists || !subTasksExist) {
      const subTaskResponse = await addSingleSubTask(taskId)
      if (subTaskResponse?.status) {
        const newTask = { ...subTaskResponse.data, peopleName: "", peopleImg: "" }
        setSelectedProject(previous => previous.map(singleTask => singleTask._id === taskId ? { ...singleTask, subTasks: [...singleTask.subTasks, newTask] } : singleTask))
      } else {
        toast.error(subTaskResponse.message)
      }
    }
  }

  const dueDateChanger = async (taskId, subTaskId, date) => {
    const dateChangeResponse = await dueDateUpdate(subTaskId, date)
    setSelectedProject(previous => previous.map(task => task._id === taskId ? { ...task, subTasks: task.subTasks.map(subTasks => subTasks._id === subTaskId ? { ...subTasks, dueDate: date } : subTasks) } : task))
    if (!dateChangeResponse?.status) {
      toast.error(dateChangeResponse.message)
    }
  }

  const subTaskChatModalHandler = () => {
    setOpenChat(previous => !previous)
  }

  const removeTaskModalHandler = () => setOpenRemoveTaskModal(previous => !previous)

  const removeTaskModalOpen = (id) => {
    setTaskId(id)
    removeTaskModalHandler()
  }

  const removeTask = async()=>{
    removeTaskModalHandler()
    const response = await removeATask(taskId)
    if(response?.status){
      setSelectedProject(previous=>previous.filter(task=>task._id !== taskId))
      toast.success(response.message)
    }else{
      toast.error(response.message)
    }
  }


  return (
    <div className="flex-1 mt-14 p-5 w-96 h-[calc(100vh-3.5rem)]">
      <h1 className="text-2xl font-bold capitalize">{state?.name ?? "Project"}</h1>
      <p className="capitalize">{state?.description}</p>
      <div className="mt-2 flex gap-2">
        <Button onClick={formHandler} className="capitalize flex items-center gap-1 transition py-1 px-2 rounded">
          Add Task
          <BiPlus className="w-4 h-4" />
        </Button>

        <Dialog size="xs" open={isFormOpen} handler={formHandler}>
          <FormComponent formHandler={formHandler} projectId={state?.id ?? 1} />
        </Dialog>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
          <BiSearchAlt2 />
          Search</button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
          <BiFilterAlt />
          Filter</button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
          <BiSort />
          Sort</button>
      </div>


      {/* Task Table */}
      <div>
        <div className="overflow-y-scroll mt-4 flex flex-col gap-4">
          {selectedProject?.map((singleTable) => (
            <TaskTable
              key={singleTable._id}
              singleTable={singleTable}
              addSubTask={addSubTask}
              dueDateChanger={dueDateChanger}
              classes={classes}
              subTaskChatModalHandler={subTaskChatModalHandler}
              isAdmin={isAdmin}
              dueDatePermitted={dueDatePermitted}
              priorityPermitted={priorityPermitted}
              peoplePermitted={peoplePermitted}
              removeTaskModalOpen={removeTaskModalOpen}
            />
          ))}
        </div>
      </div>
      <Dialog dismiss={{ escapeKey: false, outsidePress: false }} open={openChat} handler={subTaskChatModalHandler} size="md" className="outline-none">
        <SubTaskChat subTaskChatModalHandler={subTaskChatModalHandler} />
      </Dialog>
      <Dialog open={openRemoveTaskModal} handler={removeTaskModalHandler} size="sm" className="outline-none text-center">
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            Are you sure want to remove the Task ?
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button onClick={removeTask} color="black" className="w-24 py-2">Yes</Button>
          <Button onClick={removeTaskModalHandler} color="red" className="w-24 py-2">Cancel</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Projects;
