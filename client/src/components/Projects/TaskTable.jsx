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
  CardBody,
  Dialog,
  DialogBody,
  DialogFooter,
  Avatar,
} from "@material-tailwind/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { removeSubTasks } from "../../api/apiConnections/projectConnections";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
} from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import moment from "moment";
import { OptionsConsolidationComp } from "./elements/OptionsConsolidationComp";
import { SingleHeader } from "./SingleHeader";

export const TaskTable = ({
  singleTable,
  addSubTask,
  dueDateChanger,
  classes,
  subTaskChatModalHandler,
  isAdmin,
  projectPermitted,
  removeOrExportTaskModalOpen,
  addHeaderOpenHandler,
  updateDynamicField,
  addOptionModalToggle,
  statusGroup,
  priorityGroup,
  currentSubTaskPeopleModalHandler,
}) => {
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectCopyAtom
  );
  const [selectedSubTasks, setSelectedSubTasks] = useState([]);
  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [openTaskTable, setOpenTaskTable] = useState(true);
  const [taskStatus, setTaskStatus] = useState([]);
  const [taskPriority, setTaskPriority] = useState([]);
  const [taskDue, setTaskDue] = useState("");

  const openModal = (type) => {
    if (type === "remove") {
      removeOrExportTaskModalOpen(type, { _id: singleTable._id });
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
            chatCount,
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
            chatCount,
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
    const removeResponse = await removeSubTasks(selectedSubTasks);
    if (removeResponse?.status) {
      const updateProject = (selected) =>
        selected.map((task) => {
          if (task._id === singleTable._id) {
            const updated = task.subTasks.filter(
              (subTask) =>
                !selectedSubTasks.some((task) => task._id === subTask._id)
            );
            return { ...task, subTasks: updated };
          } else {
            return task;
          }
        });

      setSelectedProject((previous) => updateProject(previous));

      if (currentProject.length) {
        setCurrentProject((previous) => updateProject(previous));
      }

      setSelectedSubTasks([]);
      removeSubTaskHandler();
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
      .filter((each) => each !== "" && each !== undefined);

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
    }
  }, [singleTable?.subTasks]);

  const openTaskTableHandler = () => setOpenTaskTable((previous) => !previous);

  useEffect(() => {
    consolidationHandler();
  }, [consolidationHandler]);

  return (
    <Card className="h-full w-full min-w-max shadow-none border px-1">
      <div className="flex">
        <div className="flex gap-2 m-2 mx-1">
          <div className="flex flex-col h-12 gap-1 mt-1 items-center">
            <BiChevronDownCircle
              onClick={openTaskTableHandler}
              className="cursor-pointer w-5 h-5"
            />

            {openTaskTable && (
              <div className="relative group z-50">
                <BiDotsVerticalRounded className="cursor-pointer w-5 h-5" />

                <div className="absolute bg-white hidden group-hover:flex flex-col justify-center items-center border z-10 p-1 shadow-lg rounded w-20 max-w-52">
                  <div className="w-full cursor-pointer">
                    {isAdmin && (
                      <p
                        onClick={() => openModal("remove")}
                        className="p-1 pl-2 text-sm hover:bg-gray-200 rounded"
                      >
                        Remove
                      </p>
                    )}
                    <p
                      onClick={() => openModal("export")}
                      className="p-1 pl-2 text-sm hover:bg-gray-200 rounded"
                    >
                      Export
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`${!openTaskTable && "min-w-[17.5rem] w-[17.5rem]"}`}>
            <Typography
              className="capitalize relative"
              variant="h5"
              color="blue-gray"
            >
              {singleTable.name}
              {openTaskTable && (
                <p className="absolute -right-12 top-0 text-xs font-light text-gray-500">{`${
                  singleTable?.subTasks?.length &&
                  singleTable.subTasks.length === 1
                    ? "1 Task"
                    : singleTable.subTasks.length + " Tasks"
                }`}</p>
              )}
            </Typography>
            {!openTaskTable && (
              <p className="mb-2">{`${
                singleTable?.subTasks?.length &&
                singleTable.subTasks.length === 1
                  ? "1 Task"
                  : singleTable.subTasks.length + " Tasks"
              }`}</p>
            )}
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
                        <th key={header._id} className="min-w-48 border-l"></th>
                      );
                    }
                  })}
                  <td className="border-l"></td>
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
                      const filtered = singleTable?.subTasks?.flatMap(
                        (singleTask) => singleTask.people
                      );
                      const unique = {};
                      filtered.forEach((task) => {
                        if (!unique[task._id]) {
                          unique[task._id] = task;
                        }
                      });
                      const peopleArray = Object.values(unique);

                      return (
                        <td key={header._id} className="border-l w-32">
                          <div className="w-fit m-auto -space-x-4 relative">
                            {peopleArray.length > 2 ? (
                              <>
                                <Avatar
                                  className="w-8 h-8 border border-blue-500 hover:z-10 focus:z-10"
                                  src={
                                    peopleArray[0]?.profilePhotoURL ??
                                    "/avatar-icon.jpg"
                                  }
                                  alt="ProfilePhoto"
                                  size="sm"
                                  loading="lazy"
                                />
                                <Avatar
                                  className="w-8 h-8 border border-blue-500 hover:z-10 focus:z-10"
                                  src={
                                    peopleArray[1]?.profilePhotoURL ??
                                    "/avatar-icon.jpg"
                                  }
                                  alt="ProfilePhoto"
                                  size="sm"
                                  loading="lazy"
                                />
                                <div className="absolute -right-3.5 top-2 text-xs text-black">
                                  +{peopleArray.length - 2}
                                </div>
                              </>
                            ) : (
                              peopleArray?.map((person) => (
                                <Avatar
                                  key={person._id}
                                  className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10"
                                  src={
                                    person.profilePhotoURL ?? "/avatar-icon.jpg"
                                  }
                                  alt="ProfilePhoto"
                                  size="sm"
                                  loading="lazy"
                                />
                              ))
                            )}
                          </div>
                        </td>
                      );
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

      {/* <div className="overflow-x-scroll px-2 py-2"> */}
      {openTaskTable ? (
        <table className="w-full min-w-max table-auto mb-1">
          <thead className="sticky -top-0.5 bg-white z-10 border border-blue-gray-200">
            <tr className="h-8">
              <th className={`${classes}`}>
                <div className="flex items-center justify-center gap-1">
                  {singleTable?.subTasks?.length ? (
                    <input
                      onChange={allSubTaskSelectionHandler}
                      type="checkbox"
                      className="w-3 h-3 rounded cursor-pointer"
                    />
                  ) : null}
                  {selectedSubTasks?.length && isAdmin ? (
                    <>
                      <MdDeleteOutline
                        onClick={removeSubTaskHandler}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                    </>
                  ) : null}
                </div>
              </th>

              {/* Table headers */}
              {singleTable?.headers?.map(({ _id, name }) => (
                <SingleHeader
                  key={_id}
                  classes={classes}
                  taskId={singleTable._id}
                  id={_id}
                  name={name}
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
                  subTask={subTask}
                  taskId={singleTable._id}
                  classes={classes}
                  headers={singleTable.headers}
                  statusGroup={statusGroup}
                  priorityGroup={priorityGroup}
                  dueDateChanger={dueDateChanger}
                  selectedSubTasks={selectedSubTasks}
                  singleSubTaskSelectionhandler={singleSubTaskSelectionhandler}
                  subTaskChatModalHandler={subTaskChatModalHandler}
                  isAdmin={isAdmin}
                  projectPermitted={projectPermitted}
                  updateDynamicField={updateDynamicField}
                  addOptionModalToggle={addOptionModalToggle}
                  currentSubTaskPeopleModalHandler={
                    currentSubTaskPeopleModalHandler
                  }
                />
              );
            })}
            <tr className="h-8">
              <td
                onClick={() => addSubTask(singleTable._id)}
                className={`${classes} group cursor-pointer`}
              >
                <BiPlus className="w-5 h-5 mx-auto group-hover:scale-150 transition delay-100 group-hover:rotate-90" />
              </td>

              {singleTable?.headers?.map((header) => {
                if (header.key === "task") {
                  return <td key={header._id} className={`${classes}`}></td>;
                } else if (header.key === "status") {
                  return (
                    <td key={header._id} className={`${classes} p-0`}>
                      <div className="h-full text-white flex">
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
                        <div className="flex p-0.5 cursor-default justify-center text-center rounded-full bg-blue-500 text-white">
                          {taskDue}
                        </div>
                      )}
                    </td>
                  );
                } else if (header.key === "priority") {
                  return (
                    <td key={header._id} className={`${classes} p-0`}>
                      <div className="h-full text-white flex">
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
                  const filtered = singleTable?.subTasks?.flatMap(
                    (singleTask) => singleTask.people
                  );
                  const unique = {};
                  filtered.forEach((task) => {
                    if (!unique[task._id]) {
                      unique[task._id] = task;
                    }
                  });
                  const peopleArray = Object.values(unique);

                  return (
                    <td key={header._id} className={`${classes} w-32`}>
                      <div className="w-fit m-auto -space-x-4 relative">
                        {peopleArray?.length > 2 ? (
                          <>
                            <Avatar
                              className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10"
                              src={
                                peopleArray[0]?.profilePhotoURL ??
                                "/avatar-icon.jpg"
                              }
                              alt="ProfilePhoto"
                              size="sm"
                              loading="lazy"
                            />
                            <Avatar
                              className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10"
                              src={
                                peopleArray[1]?.profilePhotoURL ??
                                "/avatar-icon.jpg"
                              }
                              alt="ProfilePhoto"
                              size="sm"
                              loading="lazy"
                            />
                            <div className="absolute -right-3.5 top-1 text-xs text-black">
                              +{peopleArray.length - 2}
                            </div>
                          </>
                        ) : (
                          peopleArray?.map((person) => (
                            <Avatar
                              key={person._id}
                              className="w-6 h-6 border border-blue-500 hover:z-10 focus:z-10"
                              src={person.profilePhotoURL ?? "/avatar-icon.jpg"}
                              alt="ProfilePhoto"
                              size="sm"
                              loading="lazy"
                            />
                          ))
                        )}
                      </div>
                    </td>
                  );
                } else {
                  return <td key={header._id} className={`${classes}`}></td>;
                }
              })}

              <td className="border-t border-blue-gray-200"></td>
            </tr>
          </tbody>
        </table>
      ) : null}
      {/* </div> */}
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
