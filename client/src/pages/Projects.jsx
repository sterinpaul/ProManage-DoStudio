import { BiPlus, BiSearchAlt2, BiUserCircle, BiFilterAlt, BiSort } from "react-icons/bi"
import { IoMdCloseCircle } from "react-icons/io";
import { TaskTable } from "../components/Projects/TaskTable";
import { Avatar, Button, Dialog, DialogBody, DialogFooter, Popover, PopoverContent, PopoverHandler, Typography } from "@material-tailwind/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { addSingleSubTask, dueDateUpdate, getSingleProject, removeATask } from "../api/apiConnections/projectConnections";
import { currentProjectAtom } from "../recoil/atoms/projectAtoms";
import { FormComponent } from "../components/Home/FormComponent";
import { toast } from "react-toastify";
import { SubTaskChat } from "../components/Chat/SubTaskChat";
import { configKeys } from "../api/config";
import { userDataAtom } from "../recoil/atoms/userAtoms";
import { Input } from "antd";
import { AddHeaderComponent } from "../components/Projects/elements/AddHeaderComponent";


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

  const [openSearchInput, setOpenSearchInput] = useState(false)
  const [searchedSubTask, setSearchedSubTask] = useState({})
  const [subTaskName, setSubTaskName] = useState("")
  const [allSubTasks, setAllSubTasks] = useState([])
  const [filteredSubTasks, setFilteredSubTasks] = useState([])
  const searchInputRef = useRef(null)

  const [openPersonDropdown, setOpenPersonDropdown] = useState(false)
  const [person, setPerson] = useState({})
  const [allUsers, setAllUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])

  const [openSort, setOpenSort] = useState(false)

  const [currentProject, setCurrentProject] = useState([])

  const [addHeaderOpen, setAddHeaderOpen] = useState(false)
  

  const addHeaderOpenHandler = () => {
    setAddHeaderOpen(previous => !previous)
  }


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



  // Filter project according to selection
  const filterProject = (type, selection) => {
    setSelectedProject(previous =>
      previous.map(task => {
        const filteredSubTasks = task.subTasks?.filter(subTask => subTask[type] === selection._id)
        if (filteredSubTasks.length) {
          return {
            ...task, subTasks: filteredSubTasks
          }
        }
        return null
      }).filter(each => each !== null)
    )
  }


  // Filter project after removing one filter selection
  const removedSelectionFilterProject = (type, selection) => {
    setSelectedProject(currentProject.map(task => {
      const filteredSubTasks = task.subTasks?.filter(subTask => subTask[type] === selection._id)
      if (filteredSubTasks.length) {
        return {
          ...task, subTasks: filteredSubTasks
        }
      }
      return null
    }).filter(each => each !== null)
    )
  }


  // Search Sub task Toggle
  const searchInputToggle = () => {
    if (!openSearchInput) {
      const allTasks = selectedProject.flatMap(task =>
        task.subTasks
          .filter(subTask => subTask.name)
          .map(subTask => {
            const { _id, name } = subTask
            return { _id, name }
          }
          )
      );
      setAllSubTasks(allTasks)
      setFilteredSubTasks(allTasks)
    }

    setOpenSearchInput(previous => !previous)

    if (!searchedSubTask?._id && !currentProject.length) {
      setCurrentProject(selectedProject)
    }
  }

  const searchSubTask = (event) => {
    const { value } = event.target
    const trimmed = value.trim()

    setSubTaskName(trimmed)

    if (trimmed.length) {
      const regex = new RegExp(trimmed, "i")
      setAllSubTasks(filteredSubTasks.filter(each => regex.test(each.name)))
    } else {
      setAllSubTasks(filteredSubTasks)
    }
  }


  const selectSubtask = (selectedSubTask) => {
    setSearchedSubTask(selectedSubTask)
    filterProject("_id", selectedSubTask)
    searchInputToggle()
  }

  const removeSubTaskFilter = () => {
    setSearchedSubTask({})
    setSubTaskName("")
    if (person?._id) {
      removedSelectionFilterProject("people", person)
    } else {
      setSelectedProject(currentProject)
    }
  }

  const handleClickOutside = useCallback((event) => {
    if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
      searchInputToggle()
      setSubTaskName("")
      setSearchedSubTask({})
    }
  }, [searchInputToggle])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [handleClickOutside])



  // Search a Person Toggle
  const personDropdownHandler = async () => {
    if (!openPersonDropdown) {

      const unique = {}
      selectedProject.forEach(task =>
        task.subTasks
          .filter(subTask => subTask.people)
          .forEach(subTask => {
            const { people, peopleName, peopleImg } = subTask
            const name = peopleName.split("@")[0]
            if (!unique[people]) {
              unique[people] = { _id: people, peopleName: name, peopleImg }
            }
          }
          )
      );
      const uniqueUsers = Object.values(unique)
      setAllUsers(uniqueUsers)
      setFilteredUsers(uniqueUsers)
    }

    setOpenPersonDropdown(previous => !previous)

    if (!person?._id && !currentProject.length) {
      setCurrentProject(selectedProject)
    }
  }

  const searchPerson = (event) => {
    const { value } = event.target
    const trimmed = value.trim()

    if (trimmed.length) {
      const regex = new RegExp(trimmed, "i")
      setAllUsers(filteredUsers.filter(each => regex.test(each.peopleName)))
    } else {
      setAllUsers(filteredUsers)
    }
  }

  const setSinglePersonFilter = (selectedPerson) => {
    setPerson(selectedPerson)
    filterProject("people", selectedPerson)
    personDropdownHandler()
  }

  const removePersonFilter = () => {
    setPerson({})
    if (searchedSubTask?._id) {
      removedSelectionFilterProject("_id", searchedSubTask)
    } else {
      setSelectedProject(currentProject)
    }
  }

  const handleSortToggle = () => setOpenSort(previous => !previous)

  const sortTasks = (method) => {
    setSelectedProject(previous =>
      previous
        .map(task => ({
          ...task,
          subTasks: task.subTasks ? [...task.subTasks] : []
        }))
        .sort((a, z) => {
          return method === "A-Z" ? a.name.localeCompare(z.name) : z.name.localeCompare(a.name);
        })
        .map(sortedTask => (
          sortedTask.subTasks.length
            ? {
              ...sortedTask, subTasks: sortedTask.subTasks.sort((a, z) => {
                return method === "A-Z" ? a.name.localeCompare(z.name) : z.name.localeCompare(a.name);
              })
            }
            : sortedTask
        ))
    );

    handleSortToggle();
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

        {/* Add Task */}
        <Dialog size="xs" open={isFormOpen} handler={formHandler}>
          <FormComponent formHandler={formHandler} projectId={state?.id ?? 1} />
        </Dialog>

        {openSearchInput ? (
          <div ref={searchInputRef} className="relative">
            <Input onChange={searchSubTask} defaultValue={subTaskName} className="rounded pr-5" placeholder="Search" maxLength={25} />
            <BiSearchAlt2 className="absolute bottom-1/2 translate-y-1/2 right-1 w-3 h-3" />
            {subTaskName && (
              <div className="absolute p-1 flex flex-col gap-1 shadow-lg w-full max-h-32 bg-white overflow-y-scroll border z-10">
                {allSubTasks?.length ? allSubTasks.map(subtask => (
                  <p key={subtask._id} className="cursor-pointer rounded hover:bg-gray-100 pl-1 text-nowrap whitespace-nowrap overflow-hidden overflow-ellipsis" onClick={() => selectSubtask(subtask)}>{subtask.name}</p>
                )) : <p className="text-gray-500 m-auto text-center">No tasks found</p>
                }
              </div>
            )}
          </div>
        ) : (
          searchedSubTask?._id ? (
            <button className="max-w-28 flex items-center gap-1 transition duration-150 text-slate-500 bg-blue-200 shadow-md py-1 px-2 rounded outline-none">
              <p className="text-nowrap whitespace-nowrap overflow-hidden overflow-ellipsis">{searchedSubTask.name}</p>
              <IoMdCloseCircle onClick={removeSubTaskFilter} className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={searchInputToggle} className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 hover:shadow-md py-1 px-2 rounded outline-none">
              <BiSearchAlt2 />
              <p className="hidden md:block">Search</p>
            </button>
          )
        )}

        {person?._id ? (
          <button className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 bg-blue-200 shadow-lg outline-none`}>
            <img className="w-5 h-5 rounded-full" src={person.peopleImg ?? "/avatar-icon.jpg"} alt="Person Photo" />
            <p className="hidden md:block">Person</p>
            <IoMdCloseCircle onClick={removePersonFilter} className="w-4 h-4" />
          </button>
        ) : (
          <Popover open={openPersonDropdown} handler={personDropdownHandler} placement="bottom">
            <PopoverHandler>
              <button className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 hover:bg-blue-200 hover:shadow-md outline-none ${openPersonDropdown && "bg-blue-200 shadow-lg"}`}>
                <BiUserCircle className="w-4 h-4" />
                <p className="hidden md:block">Person</p>
              </button>
            </PopoverHandler>
            <PopoverContent className="p-3 w-52 flex flex-col justify-between gap-2 shadow-xl">
              <h2>Filter this board by person</h2>
              <div className="relative">
                <Input onChange={searchPerson} className="rounded pr-5" placeholder="Search" maxLength={25} />
                <BiSearchAlt2 className="absolute bottom-1/2 translate-y-1/2 right-1 w-3 h-3" />
              </div>
              <div className="flex items-end gap-1 overflow-x-scroll no-scrollbar h-14">
                {allUsers?.length ? allUsers.map((user, index) => {
                  return (
                    <div key={user._id} className="relative group">
                      <Avatar onClick={() => setSinglePersonFilter(user)} className="min-w-7 w-7 h-7 cursor-pointer border" src={user?.peopleImg ?? "/avatar-icon.jpg"} alt="ProfilePhoto" size="sm" />
                      <p className={`absolute font-light hidden group-hover:block z-10 -top-6 ${index === 0 && "left-0"} px-1 py-0 shadow border bg-black text-white rounded text-sm`}>{user.peopleName}</p>
                    </div>
                  )
                }) : <p className="text-gray-500 m-auto text-center">No users found</p>}

              </div>
            </PopoverContent>
          </Popover>)
        }

        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded outline-none">
          <BiFilterAlt />
          <p className="hidden md:block">Filter</p>
        </button>


        <Popover placement="bottom" open={openSort} handler={handleSortToggle}>
          <PopoverHandler>
            <button className={`flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 hover:shadow-md py-1 px-2 rounded outline-none ${openSort && "bg-blue-200"}`}>
              <BiSort />
              <p className="hidden md:block">Sort</p>
            </button>
          </PopoverHandler>
          <PopoverContent className="p-1 rounded flex flex-col gap-1 cursor-pointer">
            <p onClick={() => sortTasks("A-Z")} className="px-2 hover:bg-gray-100 rounded">A - Z</p>
            <p onClick={() => sortTasks("Z-A")} className="px-2 hover:bg-gray-100 rounded">Z - A</p>
          </PopoverContent>
        </Popover>

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
              addHeaderOpenHandler={addHeaderOpenHandler}
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

      <Dialog dismiss={{ escapeKey: false, outsidePress: false }} open={addHeaderOpen} handler={addHeaderOpenHandler} size="xs" className="outline-none">
        <AddHeaderComponent addHeaderOpenHandler={addHeaderOpenHandler} />
      </Dialog>

    </div>
  );
};

export default Projects;
