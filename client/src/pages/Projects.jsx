import {
  BiPlus,
  BiSearchAlt2,
  BiUserCircle,
  BiFilterAlt,
  BiSort,
} from "react-icons/bi";
import { FaArrowsTurnToDots } from "react-icons/fa6";
import { IoMdCloseCircle } from "react-icons/io";
import { TaskTable } from "../components/Projects/TaskTable";
import {
  Avatar,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Popover,
  PopoverContent,
  PopoverHandler,
  Typography,
} from "@material-tailwind/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  dueDateUpdate,
  dynamicFieldUpdate,
  getAllHeaders,
  getAllPriorityOptions,
  getAllStatusOptions,
  getPermittedHeaders,
  getSingleProject,
  headerDnd,
  projectDnD,
  projectSubTaskDnD,
  removeATask,
} from "../api/apiConnections/projectConnections";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
  permittedHeadersAtom,
  priorityOptionsAtom,
  statusOptionsAtom,
  filterStatusAtom,
  projectHeadersAtom,
} from "../recoil/atoms/projectAtoms";
import { FormComponent } from "../components/Home/FormComponent";
import { toast } from "react-toastify";
import { SubTaskChat } from "../components/Chat/SubTaskChat";
import { configKeys } from "../api/config";
import { userDataAtom } from "../recoil/atoms/userAtoms";
import { Input } from "antd";
import { AddHeaderComponent } from "../components/Projects/elements/AddHeaderComponent";

import { DndContext } from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { AddDynamicOptionComponent } from "../components/Projects/elements/AddDynamicOptionComponent";
import moment from "moment";
import { PeopleSelectComponent } from "../components/Projects/elements/PeopleSelectComponent";
import {
  liveUpdationDateAtom,
  liveUpdationDynamicFieldAtom,
  liveUpdationRemoveTaskAtom,
} from "../recoil/atoms/liveUpdationAtoms";

const Projects = () => {
  const { state } = useLocation();
  const userData = useRecoilValue(userDataAtom);
  const [selectedProject, setSelectedProject] =
    useRecoilState(currentProjectAtom);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectCopyAtom
  );
  const setHeaders = useSetRecoilState(projectHeadersAtom);
  const setIsFiltered = useSetRecoilState(filterStatusAtom);
  const [statusGroup, setStatusGroup] = useRecoilState(statusOptionsAtom);
  const [priorityGroup, setPriorityGroup] = useRecoilState(priorityOptionsAtom);
  const setPermittedHeaders = useSetRecoilState(permittedHeadersAtom);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatExists, setChatExists] = useState(false);
  const [openTaskArrangePopup, setOpenTaskArrangePopup] = useState(false);

  // Live Updations
  const setLiveUpdationDate = useSetRecoilState(liveUpdationDateAtom);
  const setLiveUpdationDynamicField = useSetRecoilState(
    liveUpdationDynamicFieldAtom
  );
  const setLiveUpdationRemoveTask = useSetRecoilState(
    liveUpdationRemoveTaskAtom
  );

  const [openSearchInput, setOpenSearchInput] = useState(false);
  const [subTaskName, setSubTaskName] = useState("");
  const searchInputRef = useRef(null);
  const searchTaskRef = useRef(null);

  const [openPersonDropdown, setOpenPersonDropdown] = useState(false);
  const [person, setPerson] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [openSort, setOpenSort] = useState(false);

  const [addHeaderOpen, setAddHeaderOpen] = useState(false);

  const [dynamicSelectFieldType, setDynamicSelectFieldType] = useState("");
  const [openDynamicSelectFieldModal, setOpenDynamicSelectFieldModal] =
    useState(false);

  const [openRemoveOrExportTaskModal, setOpenRemoveOrExportTaskModal] =
    useState(false);
  const [taskData, setTaskData] = useState({});
  const [exportOrRemoveOption, setExportOrRemoveOption] = useState("");

  const [openPeopleModal, setOpenPeopleModal] = useState(false);
  const [currentSubTaskPeople, setCurrentSubTaskPeople] = useState([]);
  const [taskSubTaskIds, setTaskSubTaskIds] = useState({});

  const [dragTaskId, setDragTaskId] = useState(null);
  const [dragSubTaskId, setDragSubTaskId] = useState(null);

  const isAdmin = userData?.role === configKeys.ADMIN_ROLE ? true : false;
  const classes = "border border-blue-gray-200";

  const projectPermitted = userData?.permissions?.find(
    (project) => project?.projectId === state.id
  );

  const onDragStart = (e, taskDragId, subTaskDragId = null) => {
    setDragTaskId(taskDragId);
    if (subTaskDragId) {
      setDragSubTaskId(subTaskDragId);
    }
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = async (e, dropId, dropSubTaskId = null) => {
    e.preventDefault();
    if (dropSubTaskId) {
      if (
        dragSubTaskId !== null &&
        dragSubTaskId !== undefined &&
        dropSubTaskId !== null &&
        dropSubTaskId !== undefined &&
        dragSubTaskId !== dropSubTaskId &&
        dropId === dragTaskId
      ) {
        const dragSubTask = {
          ...selectedProject
            .find((tasks) => tasks._id === dragTaskId)
            ?.subTasks?.find((subTasks) => subTasks._id === dragSubTaskId),
        };
        const dropSubTask = {
          ...selectedProject
            .find((tasks) => tasks._id === dropId)
            ?.subTasks?.find((subTasks) => subTasks._id === dropSubTaskId),
        };

        let temp = dragSubTask.order;
        dragSubTask.order = dropSubTask.order;
        dropSubTask.order = temp;

        const updateProject = (selected) =>
          selected.map((task) => {
            if (task._id === dragTaskId) {
              return {
                ...task,
                subTasks: task.subTasks.map((subTask) => {
                  if (subTask._id === dragSubTaskId) {
                    return dropSubTask;
                  } else if (subTask._id === dropSubTaskId) {
                    return dragSubTask;
                  } else {
                    return subTask;
                  }
                }),
              };
            } else {
              return task;
            }
          });

        setSelectedProject((previous) => updateProject(previous));
        setCurrentProject((previous) => updateProject(previous));

        const response = await projectSubTaskDnD({
          dragSubTaskId,
          dragOrder: dragSubTask.order,
          dropSubTaskId,
          dropOrder: dropSubTask.order,
        });

        if (!response?.status) {
          toast.error("Internal error");
        }
      }
    } else {
      if (
        dragTaskId !== null &&
        dragTaskId !== undefined &&
        dropId !== null &&
        dropId !== undefined &&
        dragTaskId !== dropId
      ) {
        const dragTask = {
          ...selectedProject.find((tasks) => tasks._id === dragTaskId),
        };
        const dropTask = {
          ...selectedProject.find((tasks) => tasks._id === dropId),
        };

        let temp = dragTask.order;
        dragTask.order = dropTask.order;
        dropTask.order = temp;

        const updateProject = (selected) =>
          selected.map((task) => {
            if (task._id === dragTaskId) {
              return dropTask;
            } else if (task._id === dropId) {
              return dragTask;
            } else {
              return task;
            }
          });

        setSelectedProject((previous) => updateProject(previous));
        setCurrentProject((previous) => updateProject(previous));

        const response = await projectDnD({
          dragId: dragTaskId,
          dragOrder: dragTask.order,
          dropId,
          dropOrder: dropTask.order,
        });
        if (!response?.status) {
          toast.error("Internal error");
        }
      }
    }
  };

  // const onDragEnd = () => {
  //   // setDragTaskId(null);
  // };

  const addHeaderOpenHandler = () => {
    setAddHeaderOpen((previous) => !previous);
  };

  const getSelectedProject = async () => {
    const [project, status, priority, permissions, allHeaders] =
      await Promise.all([
        getSingleProject(state?.id),
        getAllStatusOptions(),
        getAllPriorityOptions(),
        getPermittedHeaders(),
        getAllHeaders(),
      ]);

    if (project?.status) {
      setSelectedProject(project.data);
      setCurrentProject(project.data);
    }
    if (status?.status) {
      setStatusGroup(status.data);
    }
    if (priority?.status) {
      setPriorityGroup(priority.data);
    }
    if (permissions?.status) {
      setPermittedHeaders(permissions.data);
    }

    if (allHeaders?.status) {
      setHeaders(allHeaders.data);
    }
  };

  useEffect(() => {
    getSelectedProject();
    return () => setSelectedProject([]);
  }, [state]);

  const formHandler = () => {
    if(isFormOpen){
      setTaskSubTaskIds({})
    }
    setIsFormOpen((previous) => !previous);
  };

  const addSubTask = async (taskid) => {
    const selectedTask = selectedProject?.find((task) => task._id === taskid);
    const lastSubTaskExists = selectedTask?.subTasks?.slice(-1)[0]?.task.length;

    if (lastSubTaskExists || !selectedTask?.subTasks?.length) {
      setTaskSubTaskIds({ taskId: taskid, subTaskId: "" });
      formHandler();
    }
  };

  const dueDateChanger = async (taskid, subTaskId, date) => {
    const dateChangeResponse = await dueDateUpdate(state.id, subTaskId, date);
    const updateProject = (selected) =>
      selected.map((task) =>
        task._id === taskid
          ? {
              ...task,
              subTasks: task.subTasks.map((subTasks) =>
                subTasks._id === subTaskId
                  ? { ...subTasks, dueDate: date }
                  : subTasks
              ),
            }
          : task
      );

    setSelectedProject((previous) => updateProject(previous));
    setCurrentProject((previous) => updateProject(previous));

    setLiveUpdationDate({
      projectId: state?.id,
      taskId: taskid,
      subTaskId,
      field: "dueDate",
      value: date,
      notification: {
        ...dateChangeResponse.notification,
        assignerName: userData.userName,
        assignerImg: userData.profilePhotoURL,
      },
    });

    if (!dateChangeResponse?.status) {
      toast.error(dateChangeResponse.message);
    }
  };

  const subTaskChatModalHandler = () => {
    setOpenChat((previous) => !previous);
  };

  const subTaskChatModalOpenHandler = (chatExistance) => {
    subTaskChatModalHandler();
    setChatExists(chatExistance);
  };

  const removeOrExportTaskModalHandler = () => {
    setOpenRemoveOrExportTaskModal((previous) => !previous);
  };

  const removeOrExportTaskModalOpen = (option, task) => {
    setExportOrRemoveOption(option);
    removeOrExportTaskModalHandler();
    setTaskData(task);
  };

  // Convert data into csv
  const convertToCSV = (data) => {
    const head = data?.subTasks[0];
    delete head?._id;

    const keys = ["NO.", ...Object.keys(head)];
    const csvRows = [data?.name?.toUpperCase()];
    csvRows.push(keys.join(",").toUpperCase());

    data?.subTasks?.forEach((row, index) => {
      const values = keys.map((key) => {
        if (key === "NO.") {
          return index + 1;
        } else if (key === "dueDate") {
          return row[key].length ? moment(row[key]).format("DD-MMM-YYYY") : "";
        } else if (key === "people") {
          return row[key].length
            ? row[key]
                .map((person) => person.userName)
                .join(" ")
                .toUpperCase()
            : "";
        } else {
          return row[key];
        }
      });
      csvRows.push(values.join(",").toUpperCase());
    });

    return csvRows.join("\n");
  };

  // Download tasks as csv
  const downloadCSV = (csvContent) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeOrExportTask = async () => {
    removeOrExportTaskModalHandler();
    if (exportOrRemoveOption === "remove") {
      const response = await removeATask(state.id, taskData._id, taskData.name);
      if (response?.status) {
        const updateProject = (selected) =>
          selected.filter((task) => task._id !== taskData._id);

        setSelectedProject((previous) => updateProject(previous));
        setCurrentProject((previous) => updateProject(previous));

        setLiveUpdationRemoveTask({
          projectId: state?.id,
          taskId: taskData._id,
          notification: {
            ...response.notification,
            assignerName: userData.userName,
            assignerImg: userData.profilePhotoURL,
          },
        });

        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } else {
      const csvContent = convertToCSV(taskData);
      downloadCSV(csvContent);
    }
  };

  // Filter project according to selection
  const filterProject = (type, selection) => {
    setSelectedProject(
      currentProject
        .map((task) => {
          const filteredSubTasks = task.subTasks?.filter((subTask) => {
            if (type === "subTask") {
              if (person?._id) {
                return (
                  selection.test(subTask.task) &&
                  subTask.people.some(
                    (eachPerson) => eachPerson._id === person._id
                  )
                );
              } else {
                return selection.test(subTask.task);
              }
            } else {
              if (subTaskName.length) {
                const regex = new RegExp(subTaskName, "i");
                return (
                  regex.test(subTask.task) &&
                  subTask.people.some(
                    (eachPerson) => eachPerson._id === selection._id
                  )
                );
              } else {
                return subTask.people.some(
                  (eachPerson) => eachPerson._id === selection._id
                );
              }
            }
          });
          if (filteredSubTasks.length) {
            return {
              ...task,
              subTasks: filteredSubTasks,
            };
          }
          return null;
        })
        .filter((each) => each !== null)
    );
  };


  // Filter project after removing one filter selection
  const removedSelectionFilterProject = () => {
    setSelectedProject(
      currentProject
        .map((task) => {
          const filteredSubTasks = task.subTasks?.filter((subTask) => {
            if (person?._id) {
              return subTask.people.some(
                (eachPerson) => eachPerson._id === person._id
              );
            } else if (subTaskName.length) {
              const regex = new RegExp(subTaskName, "i");
              return regex.test(subTask.task);
            }
          });
          if (filteredSubTasks.length) {
            return {
              ...task,
              subTasks: filteredSubTasks,
            };
          }
          return null;
        })
        .filter((each) => each !== null)
    );
  };

  // Search Sub task Toggle
  const searchInputToggle = () => {
    if (!openSearchInput) {
      setTimeout(() => {
        searchTaskRef?.current?.focus();
      }, 500);
    }
    setOpenSearchInput((previous) => !previous);
  };


  const removeProjectFilter = (type)=>{
    if(type === "subTask"){
      setSubTaskName("")
      setSelectedProject(
        currentProject
          .map((task) => {
            const filteredSubTasks = task.subTasks?.filter((subTask) => {
              if (person?._id) {
                return subTask.people.some(
                  (eachPerson) => eachPerson._id === person._id
                );
              } else {
                return subTask;
              }
            });
            if (filteredSubTasks.length) {
              return {
                ...task,
                subTasks: filteredSubTasks,
              };
            }
            return null;
          })
          .filter((each) => each !== null)
      );
      
    }else{
      setPerson({}) 
      setSelectedProject(
        currentProject
          .map((task) => {
            const filteredSubTasks = task.subTasks?.filter((subTask) => {
              if(subTaskName.length) {
                const regex = new RegExp(subTaskName, "i");
                return regex.test(subTask.task);
              } else {
                return subTask;
              }
            });
            if (filteredSubTasks.length) {
              return {
                ...task,
                subTasks: filteredSubTasks,
              };
            }
            return null;
          })
          .filter((each) => each !== null)
      );
    }
  }

  const searchSubTask = (event) => {
    const { value } = event.target;
    setSubTaskName(value);

    if (value.length) {
      setIsFiltered(true);
      const regex = new RegExp(value, "i");
      filterProject("subTask", regex);
    } else {
      removeProjectFilter("subTask")
    }
  };

  const handleClickOutside = useCallback(
    (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        searchInputToggle();
      }
    },
    [searchInputToggle]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // Search a Person Toggle
  const personDropdownHandler = async () => {
    if (!openPersonDropdown) {
      const unique = {};
      const combinedArr = selectedProject?.flatMap((task) =>
        task.subTasks
          .filter((subTask) => subTask?.people.length)
          .flatMap((tasks) => tasks.people)
      );
      combinedArr.forEach((people) => {
        const { _id, userName, profilePhotoURL } = people;

        if (!unique[_id]) {
          unique[_id] = { _id, userName, profilePhotoURL };
        }
      });

      const uniqueUsers = Object.values(unique);
      setAllUsers(uniqueUsers);
      setFilteredUsers(uniqueUsers);
    }

    setOpenPersonDropdown((previous) => !previous);

    // if (!person?._id) {
    //   setCurrentProject(selectedProject);
    // }
  };

  const searchPerson = (event) => {
    const { value } = event.target;
    const trimmed = value.trim();

    if (trimmed.length) {
      const regex = new RegExp(trimmed, "i");
      setAllUsers(filteredUsers.filter((each) => regex.test(each.userName)));
    } else {
      setAllUsers(filteredUsers);
    }
  };

  const setSinglePersonFilter = (selectedPerson) => {
    setPerson(selectedPerson);
    filterProject("person", selectedPerson);
    setIsFiltered(true);
    personDropdownHandler();
  };

  // const removePersonFilter = () => {
  //   setPerson({});
  //   if (subTaskName) {
  //     const regex = new RegExp(subTaskName, "i");
  //     removedSelectionFilterProject("subTask", regex);
  //   } else {
  //     setSelectedProject(currentProject);
  //     setIsFiltered(false);
  //   }
  // };

  const handleSortToggle = () => setOpenSort((previous) => !previous);

  const sortTasks = (method) => {
    setSelectedProject((previous) =>
      previous
        .map((task) => ({
          ...task,
          subTasks: task.subTasks ? [...task.subTasks] : [],
        }))
        .sort((a, z) => {
          return method === "A-Z"
            ? a.name.localeCompare(z.name)
            : z.name.localeCompare(a.name);
        })
        .map((sortedTask) =>
          sortedTask.subTasks.length
            ? {
                ...sortedTask,
                subTasks: sortedTask.subTasks.sort((a, z) => {
                  return method === "A-Z"
                    ? a.task.localeCompare(z.task)
                    : z.task.localeCompare(a.task);
                }),
              }
            : sortedTask
        )
    );

    handleSortToggle();
  };

  const updateDynamicField = async (
    fieldTaskId,
    fieldSubTaskId,
    field,
    value
  ) => {
    const dynamicFieldUpdateResponse = await dynamicFieldUpdate(
      state.id,
      fieldSubTaskId,
      field,
      value
    );
    if (dynamicFieldUpdateResponse?.status) {
      const updateProject = (selected) =>
        selected.map((task) =>
          task._id === fieldTaskId
            ? {
                ...task,
                subTasks: task.subTasks.map((subTask) =>
                  subTask._id === fieldSubTaskId
                    ? { ...subTask, [field]: value }
                    : subTask
                ),
              }
            : task
        );

      setSelectedProject((previous) => updateProject(previous));
      setCurrentProject((previous) => updateProject(previous));

      setLiveUpdationDynamicField({
        projectId: state?.id,
        taskId: fieldTaskId,
        subTaskId: fieldSubTaskId,
        field,
        value,
        notification: {
          ...dynamicFieldUpdateResponse.notification,
          assignerName: userData.userName,
          assignerImg: userData.profilePhotoURL,
        },
      });
    } else {
      toast.error(dynamicFieldUpdateResponse.message);
    }
  };

  // Drag & Drop Handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && over.id && active.id !== over.id) {
      const activeHeaderId = active.id.slice(0, 24);
      const overHeaderId = over.id.slice(0, 24);

      const taskid = active.id.slice(25);

      const updatedHeader = selectedProject.find((task) => task._id === taskid);
      const activeIndex = updatedHeader?.headers?.findIndex(
        (header) => header._id === activeHeaderId
      );
      const overIndex = updatedHeader?.headers?.findIndex(
        (header) => header._id === overHeaderId
      );

      const activeIndexOrder = updatedHeader.headers.find(
        (header) => header._id === activeHeaderId
      ).order;
      const overIndexOrder = updatedHeader.headers.find(
        (header) => header._id === overHeaderId
      ).order;

      const updateProject = (selected) =>
        selected.map((task) => {
          if (task._id === taskid) {
            const newArr = task.headers.map((header) => {
              if (header._id === activeHeaderId) {
                return { ...header, order: overIndexOrder };
              } else if (header._id === overHeaderId) {
                return { ...header, order: activeIndexOrder };
              } else {
                return header;
              }
            });
            if (newArr[overIndex] != null) {
              [newArr[activeIndex], newArr[overIndex]] = [
                newArr[overIndex],
                newArr[activeIndex],
              ];
              return { ...task, headers: newArr };
            } else {
              return task;
            }
          } else {
            return task;
          }
        });

      setSelectedProject((previous) => updateProject(previous));

      setCurrentProject((previous) => updateProject(previous));

      const dndResponse = await headerDnd(
        taskid,
        activeHeaderId,
        activeIndexOrder,
        overHeaderId,
        overIndexOrder
      );
      if (!dndResponse?.status) {
        toast.error(dndResponse.message);
      }
    }
  };

  // Add status or priority dynamically
  const dynamicFieldModalHandler = () =>
    setOpenDynamicSelectFieldModal((previous) => !previous);

  const addOptionModalToggle = (headerType) => {
    setDynamicSelectFieldType(headerType);
    dynamicFieldModalHandler();
  };

  // People selection Modal Handler
  const peopleModalHandler = () => setOpenPeopleModal((previous) => !previous);

  const currentSubTaskPeopleModalHandler = (ids, peopleArray) => {
    setCurrentSubTaskPeople(peopleArray);
    setTaskSubTaskIds(ids);
    peopleModalHandler();
  };

  const taskArrangePopupHandler = () =>
    setOpenTaskArrangePopup((previous) => !previous);

  return (
    <div className="mt-20 p-5 w-full h-[calc(100vh-5.5rem)] overflow-y-hidden">
      <h1 className="text-2xl font-bold uppercase">
        {state?.name ?? "Project"}
      </h1>

      <div className="mt-2 flex gap-2 h-8">
        <Button
          onClick={formHandler}
          className=" bg-maingreen text-black flex items-center gap-1 transition py-1 px-2 rounded"
        >
          <p className="hidden md:block">Add Group</p>
          <BiPlus className="w-4 h-4" />
        </Button>

        {openSearchInput ? (
          <div ref={searchInputRef} className="relative z-20">
            <Input
              onChange={searchSubTask}
              defaultValue={subTaskName}
              className="rounded pr-5"
              placeholder="Search"
              maxLength={25}
              ref={searchTaskRef}
            />
            <BiSearchAlt2 className="absolute bottom-1/2 translate-y-1/2 right-1 w-3 h-3" />
          </div>
        ) : subTaskName ? (
          <button className="max-w-28 flex items-center gap-1 transition duration-150 text-slate-500 bg-maingreen shadow-md py-1 px-2 rounded outline-none">
            <p className="text-nowrap whitespace-nowrap overflow-hidden overflow-ellipsis">
              {subTaskName}
            </p>
            <IoMdCloseCircle
              onClick={()=>removeProjectFilter("subTask")}
              className="w-4 h-4"
            />
          </button>
        ) : (
          <button
            onClick={searchInputToggle}
            className="flex items-center gap-1 transition duration-150 text-slate-500 bg-[#ffffffcd] hover:bg-maingreen hover:shadow-md py-1 px-2 rounded outline-none"
          >
            <BiSearchAlt2 />
            <p className="hidden md:block uppercase text-xs font-semibold">
              Search
            </p>
          </button>
        )}

        {person?._id ? (
          <button
            className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 bg-maingreen focus:bg-maingreen shadow-lg outline-none`}
          >
            <img
              className="w-5 h-5 rounded-full"
              src={person.profilePhotoURL ?? "/avatar-icon.jpg"}
              alt="Profile Photo"
            />
            <p className="hidden md:block ">Person</p>
            <IoMdCloseCircle
              onClick={()=>removeProjectFilter("person")}
              className="w-4 h-4"
            />
          </button>
        ) : (
          <Popover
            open={openPersonDropdown}
            handler={personDropdownHandler}
            placement="bottom"
          >
            <PopoverHandler>
              <button
                className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 bg-[#ffffffcd] hover:bg-maingreen hover:shadow-md outline-none ${
                  openPersonDropdown && "bg-maingreen shadow-lg"
                }`}
              >
                <BiUserCircle className="w-4 h-4" />
                <p className="hidden md:block uppercase text-xs font-semibold">
                  Person
                </p>
              </button>
            </PopoverHandler>
            <PopoverContent className="p-3 w-52 flex flex-col justify-between gap-2 shadow-xl z-10">
              <h2>Filter this board by person</h2>
              <div className="relative">
                <Input
                  onChange={searchPerson}
                  className="rounded pr-5"
                  placeholder="Search"
                  maxLength={25}
                />
                <BiSearchAlt2 className="absolute bottom-1/2 translate-y-1/2 right-1 w-3 h-3" />
              </div>
              <div className="flex items-end gap-1 overflow-x-scroll no-scrollbar h-14">
                {allUsers?.length ? (
                  allUsers.map((user, index) => {
                    return (
                      <div key={user._id} className="relative group">
                        <Avatar
                          onClick={() => setSinglePersonFilter(user)}
                          className="min-w-7 w-7 h-7 cursor-pointer border"
                          src={user?.profilePhotoURL ?? "/avatar-icon.jpg"}
                          alt="ProfilePhoto"
                          size="sm"
                        />
                        <p
                          className={`absolute font-light hidden group-hover:block z-10 -top-6 ${
                            index === 0 && "left-0"
                          } px-1 py-0 shadow border bg-black text-white rounded text-sm`}
                        >
                          {user.userName}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 m-auto text-center">
                    No users found
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 bg-[#ffffffcd] hover:bg-maingreen  hover:shadow-md py-1 px-2 rounded outline-none">
          <BiFilterAlt />
          <p className="hidden md:block">Filter</p>
        </button> */}

        <Popover placement="bottom" open={openSort} handler={handleSortToggle}>
          <PopoverHandler>
            <button
              className={`flex items-center gap-1 transition duration-150 text-slate-500 bg-[#ffffffcd] hover:bg-maingreen  hover:shadow-md py-1 px-2 rounded outline-none ${
                openSort && "bg-maingreen"
              }`}
            >
              <BiSort />
              <p className="hidden md:block uppercase text-xs font-semibold">
                Sort
              </p>
            </button>
          </PopoverHandler>
          <PopoverContent className="p-1 rounded flex flex-col gap-1 cursor-pointer z-10">
            <p
              onClick={() => sortTasks("A-Z")}
              className="px-2 hover:bg-gray-100 rounded"
            >
              A - Z
            </p>
            <p
              onClick={() => sortTasks("Z-A")}
              className="px-2 hover:bg-gray-100 rounded"
            >
              Z - A
            </p>
          </PopoverContent>
        </Popover>

        <Popover
          open={openTaskArrangePopup}
          handler={taskArrangePopupHandler}
          placement="bottom"
        >
          <PopoverHandler>
            <button
              className={`rounded flex gap-1 items-center py-1 px-2 transition duration-150 text-slate-500 bg-[#ffffffcd] hover:bg-maingreen hover:shadow-md outline-none ${
                openTaskArrangePopup && "bg-maingreen shadow-lg"
              }`}
            >
              <FaArrowsTurnToDots className="w-4 h-4" />
              <p className="hidden md:block uppercase text-xs font-semibold">
                Arrange Tasks
              </p>
            </button>
          </PopoverHandler>
          <PopoverContent className="p-2 w-52 max-h-96 shadow-xl z-10">
            <div className="flex flex-col gap-2 overflow-y-scroll no-scrollbar">
              {selectedProject?.length ? (
                selectedProject.map(({ _id, name }) => {
                  return (
                    <p
                      draggable
                      onDragStart={(e) => onDragStart(e, _id)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, _id)}
                      key={_id}
                      className="pl-2 mx-1 cursor-move rounded capitalize bg-maingreen hover:bg-maingreenhvr text-nowrap whitespace-nowrap overflow-hidden overflow-ellipsis"
                    >
                      {name}
                    </p>
                  );
                })
              ) : (
                <p className="text-gray-500 m-auto text-center">No Tasks</p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <DndContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        {/* Tasks Table */}
        <div className="my-4 overflow-y-scroll h-[calc(100vh-13rem)] no-scrollbar">
          <div className="flex flex-col gap-4 ">
            {selectedProject.length ? (
              selectedProject.map((singleTable, index) => (
                <TaskTable
                  key={singleTable._id}
                  projectId={state.id}
                  singleTable={singleTable}
                  addSubTask={addSubTask}
                  dueDateChanger={dueDateChanger}
                  classes={classes}
                  subTaskChatModalOpenHandler={subTaskChatModalOpenHandler}
                  isAdmin={isAdmin}
                  projectPermitted={projectPermitted}
                  removeOrExportTaskModalOpen={removeOrExportTaskModalOpen}
                  addHeaderOpenHandler={addHeaderOpenHandler}
                  updateDynamicField={updateDynamicField}
                  addOptionModalToggle={addOptionModalToggle}
                  statusGroup={statusGroup}
                  priorityGroup={priorityGroup}
                  currentSubTaskPeopleModalHandler={
                    currentSubTaskPeopleModalHandler
                  }
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  index={index + 1}
                  taskCount={selectedProject.length}
                />
              ))
            ) : (
              <p>No Projects found</p>
            )}
          </div>
        </div>
      </DndContext>

      {/* Add Task */}
      <Dialog size="xs" open={isFormOpen} handler={formHandler}>
        <FormComponent
          formHandler={formHandler}
          projectId={state?.id}
          taskId={taskSubTaskIds.taskId}
        />
      </Dialog>

      <Dialog
        dismiss={{ escapeKey: false, outsidePress: false }}
        open={openChat}
        handler={subTaskChatModalHandler}
        size="md"
        className="outline-none"
      >
        <SubTaskChat
          subTaskChatModalHandler={subTaskChatModalHandler}
          chatExists={chatExists}
        />
      </Dialog>

      <Dialog
        open={openRemoveOrExportTaskModal}
        handler={removeOrExportTaskModalHandler}
        size="xs"
        className="outline-none text-center"
      >
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            {`Do you want to ${exportOrRemoveOption} the Task ?`}
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button
            onClick={removeOrExportTask}
            color={`${exportOrRemoveOption === "export" ? "blue" : "red"}`}
            className="w-24 py-2"
          >
            Yes
          </Button>
          <Button
            onClick={removeOrExportTaskModalHandler}
            color="black"
            className="w-24 py-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        dismiss={{ escapeKey: false, outsidePress: false }}
        open={addHeaderOpen}
        handler={addHeaderOpenHandler}
        size="xs"
        className="outline-none"
      >
        <AddHeaderComponent
          projectId={state.id}
          addHeaderOpenHandler={addHeaderOpenHandler}
        />
      </Dialog>

      {/* Dynamic option field Modal */}
      <Dialog
        size="xs"
        dismiss={{ escapeKey: false, outsidePress: false }}
        open={openDynamicSelectFieldModal}
        handler={dynamicFieldModalHandler}
        className="outline-none"
      >
        <AddDynamicOptionComponent
          projectId={state?.id}
          dynamicSelectFieldType={dynamicSelectFieldType}
          dynamicFieldModalHandler={dynamicFieldModalHandler}
          setStatusGroup={setStatusGroup}
          setPriorityGroup={setPriorityGroup}
        />
      </Dialog>

      <Dialog
        open={openPeopleModal}
        handler={peopleModalHandler}
        size="xs"
        className="outline-none"
      >
        <PeopleSelectComponent
          projectId={state.id}
          taskSubTaskIds={taskSubTaskIds}
          currentSubTaskPeople={currentSubTaskPeople}
          setCurrentSubTaskPeople={setCurrentSubTaskPeople}
          peopleModalHandler={peopleModalHandler}
        />
      </Dialog>
    </div>
  );
};

export default Projects;
