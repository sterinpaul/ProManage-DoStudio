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
import React, { useState, useEffect, useRef, useCallback } from "react";
import { SelectComponent } from "./elements/SelectComponent";
import { MdEdit } from "react-icons/md";
import { InputComponent } from "../Home/InputComponent";
import { toast } from "react-toastify";
import {
  subTaskToPerson,
  updatePriority,
  updateStatus,
  updateSubTaskName,
  updateSubTaskNote,
} from "../../api/apiConnections/projectConnections";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
  permittedHeadersAtom,
  taskSubTaskAtom,
} from "../../recoil/atoms/projectAtoms";
import { TextAreaComponent } from "../Home/TextAreaComponent";
import { getUsersForAssignSubTask } from "../../api/apiConnections/userConnections";
import { userDataAtom } from "../../recoil/atoms/userAtoms";
import { assignNotifyAtom } from "../../recoil/atoms/chatAtoms";
import {
  TbAlertSquareRoundedFilled,
  TbSquareRoundedCheckFilled,
} from "react-icons/tb";
import { DynamicSubTask } from "./elements/DynamicSubTask";

export const SubTask = ({
  subTask,
  taskId,
  classes,
  headers,
  statusGroup,
  priorityGroup,
  dueDateChanger,
  selectedSubTasks,
  singleSubTaskSelectionhandler,
  subTaskChatModalHandler,
  isAdmin,
  projectPermitted,
  updateDynamicField,
  addOptionModalToggle,
}) => {
  const user = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectCopyAtom
  );
  const setPeopleAssignNotification = useSetRecoilState(assignNotifyAtom);
  const setTaskSubTaskId = useSetRecoilState(taskSubTaskAtom);
  const [selectedDate, setSelectedDate] = useState(
    subTask.dueDate ? dayjs(subTask.dueDate) : null
  );
  const checkboxSelected = selectedSubTasks?.some(
    (task) => task?._id === subTask?._id
  );

  const [editToggle, setEditToggle] = useState(false);
  const [editNotesToggle, setEditNotesToggle] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [notesError, setNotesError] = useState(false);
  const [subTaskName, setSubTaskName] = useState(subTask?.task);
  const [subTaskNotes, setSubTaskNotes] = useState(subTask?.notes);
  const [usersForAssign, setUsersForAssign] = useState([]);
  const [openPopoverHover, setOpenPopoverHover] = useState(false);
  const [openPeopleModal, setOpenPeopleModal] = useState(false);

  const permittedHeaders = useRecoilValue(permittedHeadersAtom);

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
    (head) => head.key === "people"
  );
  const isNotesAccess = isAdmin
    ? true
    : isNotesNotAllowed
    ? projectPermitted?.allowedPermissions?.includes("people") ?? false
    : true;

  const dropdownRef = useRef(null);

  const openChatBox = () => {
    setTaskSubTaskId({ taskId, subTaskId: subTask._id });
    subTaskChatModalHandler();
  };

  const peopleModalhandler = async () => {
    if (isPeopleAccess) {
      if (!openPeopleModal) {
        const response = await getUsersForAssignSubTask();
        if (response?.status) {
          setUsersForAssign(response.data);
        }
      }
      setOpenPeopleModal((previous) => !previous);
    }
  };

  const assignPerson = async (userData) => {
    const response = await subTaskToPerson(subTask._id, userData._id);
    if (response?.status) {
      const updateProject = (selected) =>
        selected.map((task) =>
          task._id === taskId
            ? {
                ...task,
                subTasks: task.subTasks.map((subTasks) =>
                  subTask._id === subTasks._id
                    ? {
                        ...subTasks,
                        people: [...subTasks.people, userData],
                      }
                    : subTasks
                ),
              }
            : task
        );

      setSelectedProject((previous) => updateProject(previous));

      if (currentProject.length) {
        setCurrentProject((previous) => updateProject(previous));
      }

      const assigner = user.email.split("@")[0];
      const assignee = userData.email.split("@")[0];

      setPeopleAssignNotification({ assigner, assignee });
      setOpenPeopleModal((previous) => !previous);
    }
  };

  const triggers = {
    onMouseEnter: () => setOpenPopoverHover(true),
    onMouseLeave: () => setOpenPopoverHover(false),
  };

  const disabledDate = (current) => {
    return current && current < moment().endOf("day");
  };

  const dateChange = (date) => {
    setSelectedDate(date);
    dueDateChanger(taskId, subTask._id, date);
  };

  const selectSubTask = (event) => {
    const {
      chatCount,
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
    setEditNotesToggle(!editNotesToggle);
  };

  const updateName = async (event) => {
    event.preventDefault();
    openEditNameInput();
    if (subTaskName.trim().length) {
      setNameError(false);
      if (subTask.task !== subTaskName) {
        const response = await updateSubTaskName(subTask._id, subTaskName);
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

          if (currentProject.length) {
            setCurrentProject((previous) => updateProject(previous));
          }

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
    if (subTaskNotes.trim().length) {
      setNotesError(false);
      if (subTask.notes !== subTaskNotes) {
        const response = await updateSubTaskNote(subTask._id, subTaskNotes);
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

          if (currentProject.length) {
            setCurrentProject((previous) => updateProject(previous));
          }

          setEditNotesToggle(false);
        } else {
          toast.error(response.message);
        }
      }
    } else {
      setNotesError(true);
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

    if (currentProject.length) {
      setCurrentProject((previous) => updateProject(previous));
    }

    if (headerType === "status") {
      const response = await updateStatus(subTask._id, option);
      if (!response?.status) {
        toast.error(response.message);
      }
    } else {
      if (headerType === "priority") {
        const response = await updatePriority(subTask._id, option);
        if (!response?.status) {
          toast.error(response.message);
        }
      }
    }
  };

  const handleClickOutside = useCallback(
    (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        peopleModalhandler();
      }
    },
    [peopleModalhandler]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <tr className="even:bg-blue-gray-50 odd:bg-gray-100 hover:bg-white">
      <td className={`${classes} text-center w-14`}>
        <input
          checked={checkboxSelected}
          onChange={selectSubTask}
          type="checkbox"
          className="w-3 h-3 rounded cursor-pointer"
        />
      </td>

      {headers?.map((header) => {
        if (header.key === "task") {
          return (
            <td
              key={header._id}
              className={`${
                nameError && "outline-2 h-full outline-dashed outline-red-600"
              } ${classes} cursor-pointer w-60 p-0`}
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
                    <div className="w-44">
                      <p className="whitespace-nowrap overflow-hidden overflow-ellipsis capitalize">
                        {subTaskName}
                      </p>
                      <MdEdit
                        onClick={openEditNameInput}
                        className="absolute hidden right-0 top-2 group-hover:block w-4 h-4"
                      />
                    </div>
                  )}
                </div>

                <div
                  onClick={openChatBox}
                  className="border-l border-blue-gray-200 relative flex justify-center items-center w-16"
                >
                  <HiOutlineChatBubbleOvalLeft className="w-6 h-6" />
                  {subTask?.chatUnreadCount ? (
                    <div className="absolute top-2 right-1 rounded-full w-4 h-4 flex items-center justify-center text-white bg-green-500">
                      <p className="text-center p-[2px] whitespace-nowrap overflow-hidden overflow-ellipsis text-[9px]">
                        {subTask.chatUnreadCount}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </td>
          );
        } else if (header.key === "status") {
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
              <div className="flex items-center justify-around">
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
                    allowClear={false}
                    className=" bg-transparent"
                    disabledDate={disabledDate}
                    format="DD-MMM-YYYY"
                    defaultValue={selectedDate}
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
            <td key={header._id} className={`${classes} text-center`}>
              <div
                onClick={peopleModalhandler}
                className="relative -space-x-4 w-fit m-auto flex justify-center items-center"
              >
                {subTask?.people?.length ? (
                  subTask.people.map((person) => {
                    return (
                      <div
                        key={person._id}
                        className="absolute hover:z-10 group"
                      >
                        <Avatar
                          className="min-w-7 w-7 h-7 cursor-pointer border border-blue-500"
                          src={person?.profilePhotoURL ?? "/avatar-icon.jpg"}
                          alt="ProfilePhoto"
                          size="sm"
                        />
                        <p className="absolute hidden group-hover:block -top-7 right-1/2 translate-x-1/2 px-2 shadow-xl border bg-white rounded-full ">
                          {person?.email?.split("@")[0]}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <Avatar
                    className="w-7 h-7 border border-blue-500"
                    src="/avatar-icon.jpg"
                    alt="ProfilePhoto"
                    size="sm"
                  />
                )}

                {openPeopleModal && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-30 bottom-6 border right-1/2 translate-x-1/2 flex flex-wrap pb-1 px-5 pt-6 rounded shadow-md gap-1 max-w-lg h-14 w-36 bg-white overflow-y-scroll"
                  >
                    {usersForAssign?.length ? (
                      usersForAssign.map((user, index) => {
                        const userId = user.email.split("@")[0];
                        return (
                          <div key={user._id} className="relative group">
                            <Avatar
                              onClick={() => assignPerson(user)}
                              className="w-7 h-7 cursor-pointer border"
                              src={user?.profilePhotoURL ?? "/avatar-icon.jpg"}
                              alt="ProfilePhoto"
                              size="sm"
                            />
                            <p
                              className={`absolute hidden group-hover:block z-10 -top-5 ${
                                index % 3 === 0 ? "left-0" : "right-0"
                              } px-1 py-0 shadow border bg-white rounded-full text-sm`}
                            >
                              {userId}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 m-auto text-center">
                        No users
                      </p>
                    )}
                  </div>
                )}
              </div>
            </td>
          );
        } else if (header.key === "notes") {
          return (
            <td
              key={header._id}
              className={`${
                notesError && "outline-2 outline-dashed outline-red-600"
              } ${classes} relative group cursor-pointer`}
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
                      className="max-w-52 overflow-y-scroll"
                    >
                      {subTaskNotes}
                    </PopoverContent>
                  </Popover>
                  <MdEdit
                    onClick={openEditNotesInput}
                    className="absolute hidden right-0 top-2 group-hover:block w-4 h-4"
                  />
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

      <td className="border-r border-blue-gray-200 bg-white"></td>
    </tr>
  );
};
