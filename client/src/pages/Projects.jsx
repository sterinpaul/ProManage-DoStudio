import { BiPlus, BiSearchAlt2, BiUserCircle, BiFilterAlt, BiSort } from "react-icons/bi"
import { IoMdCloseCircle } from "react-icons/io";
import { TaskTable } from "../components/Projects/TaskTable";
import { Avatar, Button, Dialog, DialogBody, DialogFooter, Popover, PopoverContent, PopoverHandler, Typography } from "@material-tailwind/react";
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
  const [allUsers, setAllUsers] = useState([])
  const [openPersonDropdown, setOpenPersonDropdown] = useState(false)
  const [person, setPerson] = useState({})
  const [currentProject, setCurrentProject] = useState([])

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

  const removeTask = async () => {
    removeTaskModalHandler()
    const response = await removeATask(taskId)
    if (response?.status) {
      setSelectedProject(previous => previous.filter(task => task._id !== taskId))
      toast.success(response.message)
    } else {
      toast.error(response.message)
    }
  }

  const personDropdownHandler = async () => {
    if (!openPersonDropdown) {

      const unique = {}
      selectedProject.forEach(task =>
        task.subTasks
          .filter(subTask => subTask.people)
          .forEach(subTask => {
            const { people, peopleName, peopleImg } = subTask;
            if (!unique[people]) {
              unique[people] = { _id: people, peopleName, peopleImg }
            }
          }
          )
      );
      setAllUsers(Object.values(unique))
    }
    setOpenPersonDropdown(previous => !previous)
    if (!person?._id) {
      setCurrentProject(selectedProject)
    }
  }

  const setSinglePersonFilter = (selectedPerson) => {
    setPerson(selectedPerson)
    setSelectedProject(previous =>
      previous.map(task => {
        const filteredSubTasks = task.subTasks?.filter(subTask =>subTask?.people === selectedPerson._id)
        if (filteredSubTasks.length) {
          return {
            ...task, subTasks: filteredSubTasks
          }
        }
        return null
      }).filter(each=>each !== null)
    )
    personDropdownHandler()
  }

  const removePersonFilter = ()=>{
    setPerson({})
    setSelectedProject(currentProject)
  }


  return (
    <div className="mt-14 mr-1 mb-1 p-5 w-full h-[calc(100vh-3.8rem)] overflow-y-hidden">
      <h1 className="text-2xl font-bold capitalize">{state?.name ?? "Project"}</h1>
      <p className="capitalize">{state?.description}</p>
      <div className="mt-2 flex gap-2 h-8">
        <Button onClick={formHandler} className="capitalize flex items-center gap-1 transition py-1 px-2 rounded">
          <p className="hidden md:block">Add Task</p>
          <BiPlus className="w-4 h-4" />
        </Button>
        <Dialog size="xs" open={isFormOpen} handler={formHandler}>
          <FormComponent formHandler={formHandler} projectId={state?.id ?? 1} />
        </Dialog>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiSearchAlt2 />
          <p className="hidden md:block">Search</p>
        </button>

        {person?._id ? (
          <button className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 bg-blue-200 shadow-lg`}>
            <img className="w-5 h-5 rounded-full" src={person.peopleImg ?? "/avatar-icon.jpg"} alt="Person Photo" />
            <p className="hidden md:block">Person</p>
            <IoMdCloseCircle onClick={removePersonFilter} className="w-4 h-4"/>
        </button>
        ) : (
          <Popover open={openPersonDropdown} handler={personDropdownHandler} placement="bottom">
          <PopoverHandler>
            <button className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 hover:bg-blue-200 ${openPersonDropdown && "bg-blue-200 shadow-lg"}`}>
              <BiUserCircle className="w-4 h-4" />
              <p className="hidden md:block">Person</p>
            </button>
          </PopoverHandler>
          <PopoverContent>
            <div className="flex items-end justify-center overflow-x-scroll w-52 h-20">
              {allUsers?.length ? allUsers.map((user, index) => {
                const userId = user.peopleName.split("@")[0]
                return (
                  <div key={user._id} className="relative group">
                    <Avatar onClick={() => setSinglePersonFilter(user)} className="w-7 h-7 cursor-pointer border" src={user?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                    <p className={`absolute hidden group-hover:block z-10 -top-5 ${index === 0 ? "left-0" : "right-0"} px-1 py-0 shadow border bg-white rounded-full text-sm`}>{userId}</p>
                  </div>
                )
              }) : <p className="text-gray-500 m-auto text-center">No users</p>}
            </div>
          </PopoverContent>
        </Popover>)
        }

        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiFilterAlt />
          <p className="hidden md:block">Filter</p>
        </button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiSort />
          <p className="hidden md:block">Sort</p>
        </button>
      </div>


      {/* Tasks Table */}
      <div className="mt-4 overflow-y-scroll h-[calc(100vh-13rem)]">
        <div className="flex flex-col gap-4 ">
          {selectedProject.length ? selectedProject.map((singleTable) => (
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
          )) : <p>No Projects found</p>}
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
          <Button onClick={removeTask} color="red" className="w-24 py-2">Yes</Button>
          <Button onClick={removeTaskModalHandler} color="black" className="w-24 py-2">Cancel</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Projects;
