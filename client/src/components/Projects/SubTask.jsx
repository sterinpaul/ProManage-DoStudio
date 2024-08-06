import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import dayjs from "dayjs";
import { DatePicker, Space } from "antd";
import {
  Avatar,
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import moment from "moment";
import { useState, useEffect } from "react";
import { SelectComponent } from "./elements/SelectComponent";
import { InputComponent } from "../Home/InputComponent";
import { toast } from "react-toastify";
import {
  updatePriority,
  updateStatus,
  updateSubTaskName,
  updateSubTaskNote,
} from "../../api/apiConnections/projectConnections";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
  permittedHeadersAtom,
  taskSubTaskAtom,
} from "../../recoil/atoms/projectAtoms";
import { TextAreaComponent } from "../Home/TextAreaComponent";
import {
  TbAlertSquareRoundedFilled,
  TbSquareRoundedCheckFilled,
} from "react-icons/tb";
import { DynamicSubTask } from "./elements/DynamicSubTask";
import {
  liveUpdationStatusPriorityAtom,
  liveUpdationSubTaskNameAtom,
  liveUpdationSubTaskNotesAtom,
} from "../../recoil/atoms/liveUpdationAtoms";
import { userDataAtom } from "../../recoil/atoms/userAtoms";

export const SubTask = ({
  projectId,
  subTask,
  taskId,
  classes,
  headers,
  statusGroup,
  priorityGroup,
  dueDateChanger,
  selectedSubTasks,
  singleSubTaskSelectionhandler,
  subTaskChatModalOpenHandler,
  isAdmin,
  projectPermitted,
  updateDynamicField,
  addOptionModalToggle,
  currentSubTaskPeopleModalHandler,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const user = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);

  const setTaskSubTaskId = useSetRecoilState(taskSubTaskAtom);

  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    setSelectedDate(subTask?.dueDate ? dayjs(subTask.dueDate) : null);
  }, [subTask.dueDate]);

  const checkboxSelected = selectedSubTasks?.some(
    (task) => task?._id === subTask?._id
  );

  const [editToggle, setEditToggle] = useState(false);
  const [editNotesToggle, setEditNotesToggle] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [subTaskName, setSubTaskName] = useState("");
  const [subTaskNotes, setSubTaskNotes] = useState("");
  const [openPopoverHover, setOpenPopoverHover] = useState(false);

  const permittedHeaders = useRecoilValue(permittedHeadersAtom);

  // Live Updations
  const setLiveUpdationSubTaskName = useSetRecoilState(
    liveUpdationSubTaskNameAtom
  );
  const setLiveUpdationSubTaskNotes = useSetRecoilState(
    liveUpdationSubTaskNotesAtom
  );
  const setLiveUpdationStatusPriority = useSetRecoilState(
    liveUpdationStatusPriorityAtom
  );

  useEffect(() => {
    setSubTaskName(subTask?.task);
  }, [subTask?.task]);

  useEffect(() => {
    setSubTaskNotes(subTask?.notes);
  }, [subTask?.notes]);

  const isTaskNotAllowed = permittedHeaders?.some(
    (head) => head.key === "task"
  );

  const isTaskAccess = isAdmin
    ? true
    : isTaskNotAllowed
    ? projectPermitted?.allowedPermissions?.includes("task") ?? false
    : true;

  const isPeopleNotAllowed = permittedHeaders?.some(
    (head) => head.key === "people"
  );

  const isPeopleAccess = isAdmin
    ? true
    : isPeopleNotAllowed
    ? projectPermitted?.allowedPermissions?.includes("people") ?? false
    : true;

  const isNotesNotAllowed = permittedHeaders?.some(
    (head) => head.key === "notes"
  );

  const isNotesAccess = isAdmin
    ? true
    : isNotesNotAllowed
    ? projectPermitted?.allowedPermissions?.includes("notes") ?? false
    : true;

  const openChatBox = () => {
    setTaskSubTaskId({ taskId, subTaskId: subTask._id });
    subTaskChatModalOpenHandler(subTask.isChatExists);
  };

  const peopleModalHandler = (peopleArray) => {
    if (isPeopleAccess) {
      currentSubTaskPeopleModalHandler(
        { taskId, subTaskId: subTask._id },
        peopleArray
      );
    }
  };

  const triggers = {
    onMouseEnter: () => setOpenPopoverHover(true),
    onMouseLeave: () => setOpenPopoverHover(false),
  };

  const disabledDate = (current) => {
    return current && current < moment().startOf("day");
  };

  const dateChange = (date) => {
    setSelectedDate(date);
    dueDateChanger(taskId, subTask._id, date);
  };

  const selectSubTask = (event) => {
    const {
      chatUnreadCount,
      isChatExists,
      createdAt,
      updatedAt,
      isActive,
      __v,
      taskId,
      ...neededData
    } = subTask;
    singleSubTaskSelectionhandler(event.target.checked, neededData);
  };

  const openEditNameInput = () => {
    if (isTaskAccess) {
      setEditToggle(!editToggle);
    }
  };

  const openEditNotesInput = () => {
    if (isNotesAccess) {
      setEditNotesToggle(!editNotesToggle);
    }
  };

  const updateName = async (event) => {
    event.preventDefault();
    openEditNameInput();
    if (subTaskName.trim().length) {
      setNameError(false);
      if (subTask.task !== subTaskName) {
        const response = await updateSubTaskName(projectId, subTask._id, subTaskName);
        if (response?.status) {
          const updateProject = (selected) =>
            selected.map((task) =>
              task._id === taskId
                ? {
                    ...task,
                    subTasks: task.subTasks.map((subTasks) =>
                      subTask._id === subTasks._id
                        ? { ...subTasks, task: subTaskName }
                        : subTasks
                    ),
                  }
                : task
            );

          setSelectedProject((previous) => updateProject(previous));
          setCurrentProject((previous) => updateProject(previous));

          setLiveUpdationSubTaskName({
            projectId,
            taskId,
            subTaskId: subTask._id,
            field: "task",
            value: subTaskName,
            notification: {
              ...response.notification,
              assignerName: user.userName,
              assignerImg: user.profilePhotoURL,
            },
          });

          setEditToggle(false);
        } else {
          toast.error(response.message);
        }
      }
    } else {
      setNameError(true);
    }
  };
  const updateNotes = async (event) => {
    event.preventDefault();
    openEditNotesInput();

    if (subTask.notes !== subTaskNotes) {
      const response = await updateSubTaskNote(projectId, subTask._id, subTaskNotes);
      if (response?.status) {
        const updateProject = (selected) =>
          selected.map((task) =>
            task._id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map((subTasks) =>
                    subTask._id === subTasks._id
                      ? { ...subTasks, notes: subTaskNotes }
                      : subTasks
                  ),
                }
              : task
          );

        setSelectedProject((previous) => updateProject(previous));
        setCurrentProject((previous) => updateProject(previous));

        setLiveUpdationSubTaskNotes({
          projectId,
          taskId,
          subTaskId: subTask._id,
          field: "notes",
          value: subTaskNotes,
          notification: {
            ...response.notification,
            assignerName: user.userName,
            assignerImg: user.profilePhotoURL,
          },
        });

        setEditNotesToggle(false);
      } else {
        toast.error(response.message);
      }
    }
  };

  const updateSubTaskOption = async (headerType, option) => {
    const updateProject = (selected) =>
      selected.map((task) =>
        task._id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTasks) =>
                subTask._id === subTasks._id
                  ? { ...subTasks, [`${headerType}`]: option }
                  : subTasks
              ),
            }
          : task
      );

    setSelectedProject((previous) => updateProject(previous));

    setCurrentProject((previous) => updateProject(previous));

    if (headerType === "status") {
      const response = await updateStatus(projectId, subTask._id, option);
      if (response?.status) {
        setLiveUpdationStatusPriority({
          projectId,
          taskId,
          subTaskId: subTask._id,
          field: "status",
          value: option,
          notification: {
            ...response.notification,
            assignerName: user.userName,
            assignerImg: user.profilePhotoURL,
          },
        });
      } else {
        toast.error(response.message);
      }
    } else {
      if (headerType === "priority") {
        const response = await updatePriority(projectId, subTask._id, option);
        if (response?.status) {
          setLiveUpdationStatusPriority({
            projectId,
            taskId,
            subTaskId: subTask._id,
            field: "priority",
            value: option,
            notification: {
              ...response.notification,
              assignerName: user.userName,
              assignerImg: user.profilePhotoURL,
            },
          });
        } else {
          toast.error(response.message);
        }
      }
    }
  };

  return (
    <tr
      draggable
      onDragStart={(e) => onDragStart(e, taskId, subTask._id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, taskId, subTask._id)}
      className="bg-[#ffffffcd] text-black hover:bg-[#aefe00] group"
    >
      <td
        className={`${classes} sticky z-10 left-0 bg-white group-hover:bg-[#aefe00] text-center w-14 outline outline-1 outline-blue-gray-200`}
      >
        <input
          checked={checkboxSelected}
          onChange={selectSubTask}
          type="checkbox"
          className="w-3 h-3 rounded cursor-pointer"
        />
      </td>
      <td
        onDoubleClick={openEditNameInput}
        className={`${
          nameError && "outline-2 h-full outline-dashed outline-red-600"
        } ${classes} sticky z-10 left-14 bg-white group-hover:bg-[#aefe00] cursor-pointer p-0 outline outline-1 outline-blue-gray-200`}
      >
        <div className="flex justify-between h-8">
          <div className="relative group px-2.5 h-full py-1">
            {editToggle ? (
              <InputComponent
                subTaskName={subTaskName}
                setSubTaskName={setSubTaskName}
                updateName={updateName}
              />
            ) : (
              <div className="w-full">
                <p className="whitespace-nowrap overflow-hidden overflow-ellipsis capitalize">
                  {subTaskName}
                </p>
              </div>
            )}
          </div>

          <div
            onClick={openChatBox}
            className="border-l border-blue-gray-200 flex justify-center items-center w-16"
          >
            <div className="relative">
              <HiOutlineChatBubbleOvalLeft className={`w-6 h-6`} />
              {subTask.isChatExists && (
                <span className="bg-green-500 absolute top-1 right-0 rounded-full p-1"></span>
              )}
              {subTask?.chatUnreadCount ? (
                <div className="absolute top-0 -right-1 rounded-full w-4 h-4 flex items-center justify-center text-white bg-green-500">
                  <p className="text-center p-[2px] whitespace-nowrap overflow-hidden overflow-ellipsis text-[9px]">
                    {subTask.chatUnreadCount}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </td>

      {headers?.map((header) => {
        if(header.key === "task") {
          return
        }else if (header.key === "status") {
          return (
            <SelectComponent
              key={header._id}
              currentValue={subTask.status}
              valueGroup={statusGroup}
              updateSubTaskOption={updateSubTaskOption}
              headerType={"status"}
              classes={classes}
              isAdmin={isAdmin}
              addOptionModalToggle={addOptionModalToggle}
              projectPermitted={projectPermitted}
            />
          );
        } else if (header.key === "dueDate") {
          const isNotAllowed = permittedHeaders?.some(
            (head) => head.key === "dueDate"
          );
          const isAccess = isAdmin
            ? true
            : isNotAllowed
            ? projectPermitted?.allowedPermissions?.includes("dueDate") ?? false
            : true;
          return (
            <td key={header._id} className={`${classes} text-center w-36`}>
              <div className="flex items-center justify-around mx-auto w-32">
                {selectedDate &&
                  (subTask.status === "done" ? (
                    <TbSquareRoundedCheckFilled className="w-5 h-5 text-green-500" />
                  ) : (
                    <TbAlertSquareRoundedFilled
                      className={`${
                        new Date(selectedDate).getTime() < new Date().getTime()
                          ? "text-red-500"
                          : "text-green-500"
                      } w-5 h-5`}
                    />
                  ))}
                <Space direction="vertical">
                  <DatePicker
                    size="small"
                    placeholder=""
                    variant={false}
                    suffixIcon={null}
                    disabled={!isAccess}
                    onChange={dateChange}
                    allowClear={true}
                    className="bg-transparent w-28"
                    disabledDate={disabledDate}
                    format="DD-MMM-YYYY"
                    value={selectedDate}
                  />
                </Space>
              </div>
            </td>
          );
        } else if (header.key === "priority") {
          return (
            <SelectComponent
              key={header._id}
              currentValue={subTask.priority}
              valueGroup={priorityGroup}
              updateSubTaskOption={updateSubTaskOption}
              headerType={"priority"}
              classes={classes}
              isAdmin={isAdmin}
              addOptionModalToggle={addOptionModalToggle}
              projectPermitted={projectPermitted}
            />
          );
        } else if (header.key === "people") {
          return (
            <td key={header._id} className={`${classes} text-center w-32`}>
              <div
                onClick={() => peopleModalHandler(subTask?.people)}
                className="relative -space-x-4 w-fit m-auto flex justify-center items-center"
              >
                {subTask?.people?.length ? (
                  subTask.people.map((person) => {
                    return (
                      <div key={person._id} className="hover:z-10 group">
                        <Avatar
                          className="min-w-7 w-7 h-7 cursor-pointer border border-black"
                          src={person?.profilePhotoURL ?? "/avatar-icon.jpg"}
                          alt="ProfilePhoto"
                          size="sm"
                          loading="lazy"
                        />
                        <p className="absolute hidden group-hover:block -top-7 right-1/2 translate-x-1/2 px-2 shadow-xl border bg-white rounded-full ">
                          {person?.userName}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <Avatar
                    className="w-7 h-7 border border-black"
                    src="/avatar-icon.jpg"
                    alt="ProfilePhoto"
                    size="sm"
                    loading="lazy"
                  />
                )}
              </div>
            </td>
          );
        } else if (header.key === "notes") {
          return (
            <td
              key={header._id}
              className={`${classes} group cursor-pointer`}
              onDoubleClick={openEditNotesInput}
            >
              {editNotesToggle ? (
                <TextAreaComponent
                  subTaskNotes={subTaskNotes}
                  setSubTaskNotes={setSubTaskNotes}
                  updateNotes={updateNotes}
                />
              ) : (
                <div className="w-44 xl:w-52 2xl:w-96">
                  <Popover
                    open={openPopoverHover}
                    handler={setOpenPopoverHover}
                  >
                    <PopoverHandler {...triggers}>
                      <p className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                        {subTaskNotes}
                      </p>
                    </PopoverHandler>
                    <PopoverContent
                      {...triggers}
                      className="max-w-52 overflow-y-scroll z-10"
                    >
                      <p>{subTaskNotes}</p>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </td>
          );
        } else {
          return (
            <DynamicSubTask
              key={header._id}
              classes={classes}
              dynamicValue={subTask[header.key]}
              field={header.key}
              taskId={taskId}
              subTaskId={subTask._id}
              updateDynamicField={updateDynamicField}
              isAdmin={isAdmin}
            />
          );
        }
      })}

      <td className="border-r border-blue-gray-200 bg-transparent"></td>
    </tr>
  );
};
