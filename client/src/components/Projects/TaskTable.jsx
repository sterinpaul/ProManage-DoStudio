import { SubTask } from "./SubTask";
import {
  BiPlus,
  BiChevronDownCircle,
  BiDotsVerticalRounded,
} from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import {
  Button,
  Typography,
  Card,
  Dialog,
  DialogBody,
  DialogFooter,
  Avatar,
} from "@material-tailwind/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { removeSubTasks, updateSingleHeaderWidth, updateTaskName } from "../../api/apiConnections/projectConnections";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
  headerWidthActiveAtom,
  projectHeadersAtom,
} from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import moment from "moment";
import { OptionsConsolidationComp } from "./elements/OptionsConsolidationComp";
import { SingleHeader } from "./SingleHeader";
import { InputComponent } from "../Home/InputComponent";
import { liveUpdationHeadersAtom, liveUpdationRemoveSubTaskAtom, liveUpdationTaskNameAtom } from "../../recoil/atoms/liveUpdationAtoms";
import { userDataAtom } from "../../recoil/atoms/userAtoms";
import { PeopleComponent } from "./elements/PeopleComponent";

export const TaskTable = ({
  projectId,
  singleTable,
  addSubTask,
  dueDateChanger,
  classes,
  subTaskChatModalOpenHandler,
  isAdmin,
  projectPermitted,
  removeOrExportTaskModalOpen,
  addHeaderOpenHandler,
  updateDynamicField,
  addOptionModalToggle,
  statusGroup,
  priorityGroup,
  currentSubTaskPeopleModalHandler,
  onDragStart,
  onDragOver,
  onDrop,
  index,
  taskCount
}) => {
  const user = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);
  const [selectedSubTasks, setSelectedSubTasks] = useState([]);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [openTaskTable, setOpenTaskTable] = useState(true);
  const [taskStatus, setTaskStatus] = useState([]);
  const [taskPriority, setTaskPriority] = useState([]);
  const [taskDue, setTaskDue] = useState("");
  const [taskNameEdit,setTaskNameEdit] = useState(false);
  const [singleTableName,setSingleTableName] = useState("");

  const [headers,setHeaders] = useRecoilState(projectHeadersAtom)
  const headerWidthActive = useRecoilValue(headerWidthActiveAtom)


  useEffect(()=>{
    setSingleTableName(singleTable.name)
  },[singleTable.name])

  // Live Updations
  const setLiveUpdationTaskName = useSetRecoilState(liveUpdationTaskNameAtom)
  const setLiveUpdationHeaders = useSetRecoilState(liveUpdationHeadersAtom)
  const setLiveUpdationRemoveSubTask = useSetRecoilState(liveUpdationRemoveSubTaskAtom)
  
  
  const openModal = (type) => {
    if (type === "remove") {
      removeOrExportTaskModalOpen(type, { _id: singleTable._id, name:singleTable.name });
    } else {
      if (selectedSubTasks.length) {
        removeOrExportTaskModalOpen(type, {
          _id: singleTable._id,
          name: singleTable.name,
          subTasks: selectedSubTasks,
        });
      } else {
        const exportData = singleTable?.subTasks?.map((eachTask) => {
          const {
            chatUnreadCount,
            isChatExists,
            createdAt,
            updatedAt,
            isActive,
            __v,
            taskId,
            ...neededData
          } = eachTask;
          return neededData;
        });
        removeOrExportTaskModalOpen(type, {
          _id: singleTable._id,
          name: singleTable.name,
          subTasks: exportData,
        });
      }
    }
  };

  const allSubTaskSelectionHandler = (event) => {
    if (event.target.checked) {
      setSelectedSubTasks(
        singleTable?.subTasks?.map((eachTask) => {
          const {
            chatUnreadCount,
            isChatExists,
            createdAt,
            updatedAt,
            isActive,
            __v,
            taskId,
            ...neededData
          } = eachTask;
          return neededData;
        })
      );
    } else {
      setSelectedSubTasks([]);
    }
  };

  const singleSubTaskSelectionhandler = (checked, subTaskData) => {
    if (checked) {
      setSelectedSubTasks((previous) => [...previous, subTaskData]);
    } else {
      setSelectedSubTasks((previous) =>
        previous.filter((singleTask) => singleTask._id !== subTaskData._id)
      );
    }
  };

  const removeSubTaskHandler = () => {
    setOpenRemoveDialog((previous) => !previous);
  };

  const removeSubTask = async () => {
    removeSubTaskHandler();
    const subTaskIdsArr = selectedSubTasks.map((subTask) => subTask._id);
    const removeResponse = await removeSubTasks(projectId, subTaskIdsArr);
    if (removeResponse?.status) {
      const updateProject = (selected) =>
        selected.map((task) => {
          if (task._id === singleTable._id) {
            const updated = task.subTasks.filter(
              (subTask) => !subTaskIdsArr.includes(subTask._id)
            );
            return { ...task, subTasks: updated };
          } else {
            return task;
          }
        });

      setSelectedProject((previous) => updateProject(previous));
      setCurrentProject((previous) => updateProject(previous));

      setLiveUpdationRemoveSubTask({ projectId, taskId: singleTable._id, removedSubTasks: subTaskIdsArr, notification: {...removeResponse.notification,assignerName:user.userName,assignerImg: user.profilePhotoURL}});

      setSelectedSubTasks([]);
      toast.success(removeResponse.message);
    }
  };

  const consolidationHandler = useCallback(() => {
    const taskArr = singleTable?.subTasks?.map((subTask) => subTask.status);
    const taskMap = new Map();
    taskArr.forEach((each) => {
      if (taskMap.has(each)) {
        taskMap.set(each, taskMap.get(each) + 1);
      } else {
        taskMap.set(each, 1);
      }
    });
    const updatedTaskArr = [];
    taskMap.forEach((value, key) => {
      updatedTaskArr.push({ label: key, count: value });
    });
    setTaskStatus(updatedTaskArr);

    const priorityArr = singleTable?.subTasks?.map(
      (subTask) => subTask.priority
    );
    const priorityMap = new Map();
    priorityArr.forEach((each) => {
      if (priorityMap.has(each)) {
        priorityMap.set(each, priorityMap.get(each) + 1);
      } else {
        priorityMap.set(each, 1);
      }
    });
    const updatePrioritydArr = [];
    priorityMap.forEach((value, key) => {
      updatePrioritydArr.push({ label: key, count: value });
    });
    setTaskPriority(updatePrioritydArr);

    const dueDates = singleTable?.subTasks
      ?.map((subTask) => subTask.dueDate)
      .filter((each) => each !== "" && each !== undefined && each !== null);

    if (dueDates.length) {
      const dueDateArray = dueDates.sort((date1, date2) => {
        let d1 = new Date(date1);
        let d2 = new Date(date2);
        return d1 - d2;
      });

      const startD = new Date(dueDateArray[0]);
      const endD = new Date(dueDateArray[dueDateArray.length - 1]);
      if (moment(startD).format("DD MMM") == moment(endD).format("DD MMM")) {
        setTaskDue(moment(endD).format("DD MMM"));
      } else if (startD.getMonth() == endD.getMonth()) {
        setTaskDue(
          `${moment(startD).format("DD")} - ${moment(endD).format("DD MMM")}`
        );
      } else {
        setTaskDue(
          `${moment(startD).format("DD MMM")} - ${moment(endD).format(
            "DD MMM"
          )}`
        );
      }
    }else{
      setTaskDue("")
    }
  }, [singleTable?.subTasks]);

  const openTaskTableHandler = () => setOpenTaskTable((previous) => !previous);

  useEffect(() => {
    consolidationHandler();
  }, [consolidationHandler]);

  const isAccess = isAdmin
    ? true
    : projectPermitted?.allowedPermissions?.includes("remove")
    ? true
    : false;

  const taskNameEditToggle = ()=>{
    if(isAdmin){
      setTaskNameEdit(previous=>!previous)
    }
  }
  
  const updateSingleTableName = async(event)=>{
    event.preventDefault();
    taskNameEditToggle()
    const trimmedName = singleTableName.trim()
    if(trimmedName.length){
      const response = await updateTaskName(singleTable.projectId,singleTable._id,trimmedName)
      if(response?.status){
        const updateProject = (selected) =>
            selected.map((task) =>
              task._id === singleTable._id
                ? {
                    ...task,
                    name: trimmedName
                  }
                : task
            );

          setSelectedProject((previous) => updateProject(previous));
          setCurrentProject((previous) => updateProject(previous));

          setLiveUpdationTaskName({ projectId, taskId:singleTable._id, taskName:trimmedName, notification: {...response.notification,assignerName:user.userName,assignerImg: user.profilePhotoURL}});

      }else{
        toast.error(response.message)
      }
    }
  }

  // Adjusting header width
  const updateHeaderWidth = async(key,name,width)=>{
    const response = await updateSingleHeaderWidth(key,name,width)
    if(response.status){
      setHeaders(previous=>previous.map(header=>header.key === key ? {...header,width} : header))
      setLiveUpdationHeaders({ key, width, notification: {...response.notification,assignerName:user.userName,assignerImg: user.profilePhotoURL}});
    }else{
      toast.error(response.message)
    }
  }

  const dragStart = (e)=>{
    if(!headerWidthActive){
      onDragStart(e, singleTable._id)
    }
  }


  return (
    <Card
      draggable={!headerWidthActive}
      onDragStart={dragStart}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, singleTable._id)}
      // onDragEnd={onDragEnd}
      style={{ zIndex: `${taskCount - index}` }}
      className="h-full w-full min-w-max shadow-none px-1 p-5 bg-[#ffffff71] backdrop-blur-[2px]"
    >
      <div className="flex">
        <div className="flex gap-2 m-2 mx-1">
          <div className="flex flex-col h-12 gap-1 mt-1 items-center">
            <BiChevronDownCircle
              onClick={openTaskTableHandler}
              className="cursor-pointer w-5 h-5"
            />

            {openTaskTable && (
              singleTable?.subTasks?.length ? <div className="relative group">
                <BiDotsVerticalRounded className="cursor-pointer w-5 h-5" />

                <div className="absolute z-30 bg-white hidden group-hover:flex flex-col justify-center items-center border p-1 shadow-lg rounded w-20 max-w-52">
                  <div className="w-full cursor-pointer">
                    {isAccess && (
                      <p
                        onClick={() => openModal("remove")}
                        className="p-1 pl-2 text-sm hover:bg-gray-200 rounded"
                      >
                        Remove
                      </p>
                    )}
                    {singleTable?.subTasks?.length ? (
                      <p
                        onClick={() => openModal("export")}
                        className="p-1 pl-2 text-sm hover:bg-gray-200 rounded"
                      >
                        Export
                      </p>
                    ) : null}
                  </div>
                </div>
              </div> : null
            )}
          </div>
          <div
            className={`${
              !openTaskTable && "min-w-[17.5rem] w-[17.5rem]"
            }`}
          >
            {taskNameEdit ? (
              <InputComponent
                  subTaskName={singleTableName}
                  setSubTaskName={setSingleTableName}
                  updateName={updateSingleTableName}
                  taskName={true}
                />
             ) : (
             <h1 onDoubleClick={taskNameEditToggle} className="text-black text-xl font-bold capitalize">
              {singleTableName}
            </h1>
          )}

            <p className="mb-2">{`${
              singleTable?.subTasks?.length && singleTable.subTasks.length === 1
                ? "1 Task"
                : singleTable.subTasks.length + " Tasks"
              }`}
            </p>
          </div>
        </div>

        {!openTaskTable && (
          <div className="overflow-x-scroll w-full no-scrollbar mr-2">
            <table className="w-full min-w-max h-full table-auto">
              <thead>
                <tr className="align-middle">
                  {singleTable?.headers?.map((header) => {
                    if (header.key === "task") {
                      return;
                    } else if (header.key === "status") {
                      return (
                        <th key={header._id} className="w-36 border-l pt-2">
                          Status
                        </th>
                      );
                    } else if (header.key === "dueDate") {
                      return (
                        <th key={header._id} className="w-36 border-l pt-2">
                          Due Date
                        </th>
                      );
                    } else if (header.key === "priority") {
                      return (
                        <th key={header._id} className="w-36 border-l pt-2">
                          Priority
                        </th>
                      );
                    } else if (header.key === "people") {
                      return (
                        <th key={header._id} className="border-l pt-2 max-w-32">
                          People
                        </th>
                      );
                    } else {
                      return (
                        <th key={header._id} className="capitalize pt-2 min-w-48 border-l">{header.name}</th>
                      );
                    }
                  })}
                  <th className="border-l"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {singleTable?.headers?.map((header) => {
                    if (header.key === "task") {
                      return;
                    } else if (header.key === "status") {
                      return (
                        <td key={header._id} className="border-l p-0">
                          <div className="h-full flex p-1">
                            {taskStatus?.map((eachOption, index) => (
                              <OptionsConsolidationComp
                                key={index}
                                index={index}
                                taskCount={singleTable?.subTasks?.length}
                                eachOption={eachOption}
                                optionGroup={statusGroup}
                              />
                            ))}
                          </div>
                        </td>
                      );
                    } else if (header.key === "dueDate") {
                      return (
                        <td key={header._id} className="border-l px-1">
                          {taskDue && (
                            <div className="flex p-1.5 cursor-default justify-center text-center rounded-full bg-blue-500 text-white">
                              {taskDue}
                            </div>
                          )}
                        </td>
                      );
                    } else if (header.key === "priority") {
                      return (
                        <td key={header._id} className="border-l p-0">
                          <div className="h-full flex p-1">
                            {taskPriority?.map((eachOption, index) => (
                              <OptionsConsolidationComp
                                key={index}
                                index={index}
                                taskCount={singleTable?.subTasks?.length}
                                eachOption={eachOption}
                                optionGroup={priorityGroup}
                              />
                            ))}
                          </div>
                        </td>
                      );
                    } else if (header.key === "people") {

                      return <PeopleComponent key={header._id} subTasks={singleTable?.subTasks} bottomConsolidation={false} />
                     
                    } else {
                      return (
                        <td key={header._id} className="border-l">
                          <div className="w-44 xl:w-52 2xl:w-96"></div>
                        </td>
                      );
                    }
                  })}
                  <td className="border-l"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      {openTaskTable ? (
        <table className="w-full min-w-max table-auto mb-1">
          <thead className="sticky -top-0.5 z-20 bg-white outline outline-1 outline-blue-gray-200">
            <tr className="h-8 bg-white">
              <th className={`${classes} w-14 sticky z-10 left-0 bg-white outline outline-1 outline-blue-gray-200`}>
                <div className="flex items-center justify-center gap-1">
                  {singleTable?.subTasks?.length ? (
                    <input
                      onChange={allSubTaskSelectionHandler}
                      type="checkbox"
                      className="w-3 h-3 rounded cursor-pointer"
                    />
                  ) : null}
                  {selectedSubTasks?.length && isAccess ? (
                    
                      <MdDeleteOutline
                        onClick={removeSubTaskHandler}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                    
                  ) : null}
                </div>
              </th>
              

              {/* Table headers */}
              {singleTable?.headers?.map(({ _id, key, name }) => (
                <SingleHeader
                  key={_id}
                  classes={classes}
                  taskId={singleTable._id}
                  id={_id}
                  headerKey={key}
                  name={name}
                  headers={headers}
                  updateHeaderWidth={updateHeaderWidth}
                />
              ))}

              <th
                onClick={addHeaderOpenHandler}
                className={`${classes} group cursor-pointer`}
              >
                <BiPlus className="w-5 h-5 mx-auto group-hover:scale-150 transition delay-100" />
              </th>
            </tr>
          </thead>
          <tbody>
            {singleTable?.subTasks?.map((subTask) => {
              return (
                <SubTask
                  key={subTask._id}
                  projectId={projectId}
                  subTask={subTask}
                  taskId={singleTable._id}
                  classes={classes}
                  headers={singleTable.headers}
                  statusGroup={statusGroup}
                  priorityGroup={priorityGroup}
                  dueDateChanger={dueDateChanger}
                  selectedSubTasks={selectedSubTasks}
                  singleSubTaskSelectionhandler={singleSubTaskSelectionhandler}
                  subTaskChatModalOpenHandler={subTaskChatModalOpenHandler}
                  isAdmin={isAdmin}
                  projectPermitted={projectPermitted}
                  updateDynamicField={updateDynamicField}
                  addOptionModalToggle={addOptionModalToggle}
                  currentSubTaskPeopleModalHandler={
                    currentSubTaskPeopleModalHandler
                  }
                  onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
                />
              );
            })}
            <tr className="h-8">
              <td
                onClick={() => addSubTask(singleTable._id)}
                className={`${classes} group cursor-pointer sticky left-0 z-10 bg-white outline outline-1 outline-blue-gray-200`}
              >
                <BiPlus className="w-5 h-5 mx-auto group-hover:scale-150 transition delay-100 group-hover:rotate-90" />
              </td>

              {singleTable?.headers?.map((header) => {
                if (header.key === "task") {
                  return <td key={header._id} className={`${classes} sticky z-10 bg-white left-14 outline outline-1 outline-blue-gray-200`}></td>;
                } else if (header.key === "status") {
                  return (
                    <td key={header._id} className={`${classes} p-0`}>
                      <div className="h-full text-transparent flex">
                        .
                        {taskStatus?.map((eachOption, index) => (
                          <OptionsConsolidationComp
                            key={index}
                            index={index}
                            taskCount={singleTable?.subTasks?.length}
                            eachOption={eachOption}
                            optionGroup={statusGroup}
                          />
                        ))}
                        .
                      </div>
                    </td>
                  );
                } else if (header.key === "dueDate") {
                  return (
                    <td key={header._id} className={`${classes} px-1`}>
                      {taskDue && (
                        <div className="flex p-0.5 cursor-default justify-center text-center rounded-full bg-maingreen text-black text-sm">
                          {taskDue}
                        </div>
                      )}
                    </td>
                  );
                } else if (header.key === "priority") {
                  return (
                    <td key={header._id} className={`${classes} p-0`}>
                      <div className="h-full text-transparent flex">
                        .
                        {taskPriority?.map((eachOption, index) => (
                          <OptionsConsolidationComp
                            key={index}
                            index={index}
                            taskCount={singleTable?.subTasks?.length}
                            eachOption={eachOption}
                            optionGroup={priorityGroup}
                          />
                        ))}
                        .
                      </div>
                    </td>
                  );
                } else if (header.key === "people") {
                  return <PeopleComponent key={header._id} subTasks={singleTable?.subTasks} bottomConsolidation={true} />
                } else {
                  return <td key={header._id} className={`${classes}`}></td>;
                }
              })}

              <td className="border-t border-blue-gray-200"></td>
            </tr>
          </tbody>
        </table>
      ) : null}
      
      <Dialog
        open={openRemoveDialog}
        handler={removeSubTaskHandler}
        size="xs"
        className="text-center outline-none"
      >
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            Are you sure want to remove the sub task ?
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button onClick={removeSubTask} color="red" className="w-24 py-2">
            Yes
          </Button>
          <Button
            onClick={removeSubTaskHandler}
            color="black"
            className="w-24 py-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
};
