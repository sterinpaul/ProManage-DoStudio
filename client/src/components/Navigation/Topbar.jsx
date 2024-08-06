import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
// import { FixedSizeList as List } from 'react-window';
import { metaicon, Mainlogo } from "../../assets";
import {
  allProjectsAtom,
  currentProjectAtom,
  currentProjectCopyAtom,
  filterStatusAtom,
  priorityOptionsAtom,
  projectHeadersAtom,
  statusOptionsAtom,
  taskSubTaskAtom,
} from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { IoNotificationsOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { configKeys } from "../../api/config";
import {
  allChatMessageAtom,
  socketMessageAtom,
} from "../../recoil/atoms/chatAtoms";
import {
  Avatar,
  Drawer,
  IconButton,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
} from "@material-tailwind/react";
import { tokenAtom, userDataAtom } from "../../recoil/atoms/userAtoms";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllNotifications,
  getUserData,
  resetUserNotifications,
} from "../../api/apiConnections/userConnections";
import moment from "moment";
import {
  liveUpdationDateAtom,
  liveUpdationDynamicFieldAtom,
  liveUpdationTaskNameAtom,
  liveUpdationSubTaskNameAtom,
  liveUpdationSubTaskNotesAtom,
  liveUpdationStatusPriorityAtom,
  liveUpdationSubTaskPeopleAtom,
  liveUpdationAddTaskAtom,
  liveUpdationRemoveTaskAtom,
  liveUpdationRemoveSubTaskAtom,
  liveUpdationAddHeaderAtom,
  liveUpdationAddSubTaskAtom,
  liveUpdationAddRemoveProjectAtom,
  liveUpdationEditProjectAtom,
  liveUpdationStatusPriorityHeaderAtom,
  liveUpdationHeadersAtom,
} from "../../recoil/atoms/liveUpdationAtoms";

const Topbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useRecoilState(userDataAtom);
  const [notifications, setNotifications] = useState([]);
  const setToken = useSetRecoilState(tokenAtom);

  const socket = useRef(null);
  const scrollRef = useRef(null);

  const socketMessage = useRecoilValue(socketMessageAtom);
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  const [selectedProject, setSelectedProject] =
    useRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);
  const setStatusGroup = useSetRecoilState(statusOptionsAtom);
  const setPriorityGroup = useSetRecoilState(priorityOptionsAtom);
  const setHeaders = useSetRecoilState(projectHeadersAtom);

  const isFiltered = useRecoilValue(filterStatusAtom);
  const taskSubTaskId = useRecoilValue(taskSubTaskAtom);
  const setMessages = useSetRecoilState(allChatMessageAtom);
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  const [scrollToBottomValue, setScrollToBottomValue] = useState(false);
  const audio = new Audio("/sound.wav");

  // Live Updations
  const liveUpdationAddRemoveProject = useRecoilValue(
    liveUpdationAddRemoveProjectAtom
  );
  const liveUpdationEditProject = useRecoilValue(liveUpdationEditProjectAtom);
  const liveUpdationAddHeader = useRecoilValue(liveUpdationAddHeaderAtom);
  const liveUpdationAddTask = useRecoilValue(liveUpdationAddTaskAtom);
  const liveUpdationRemoveTask = useRecoilValue(liveUpdationRemoveTaskAtom);
  const liveUpdationAddSubTask = useRecoilValue(liveUpdationAddSubTaskAtom);
  const liveUpdationRemoveSubTask = useRecoilValue(
    liveUpdationRemoveSubTaskAtom
  );
  const liveUpdationTaskName = useRecoilValue(liveUpdationTaskNameAtom);
  const liveUpdationDate = useRecoilValue(liveUpdationDateAtom);
  const liveUpdationSubTaskName = useRecoilValue(liveUpdationSubTaskNameAtom);
  const liveUpdationSubTaskNotes = useRecoilValue(liveUpdationSubTaskNotesAtom);
  const liveUpdationStatusPriority = useRecoilValue(
    liveUpdationStatusPriorityAtom
  );
  const liveUpdationSubTaskPeople = useRecoilValue(
    liveUpdationSubTaskPeopleAtom
  );
  const liveUpdationDynamicField = useRecoilValue(liveUpdationDynamicFieldAtom);

  const liveUpdationStatusPriorityHeader = useRecoilValue(
    liveUpdationStatusPriorityHeaderAtom
  );
  const liveUpdationHeaders = useRecoilValue(liveUpdationHeadersAtom);

  // Update Notifications
  const updateNotification = (notification) =>
    setNotifications((previous) => [notification, ...previous]);

  const triggerNotification = (notification) => {
    audio.play();
    setUser((previous) => ({
      ...previous,
      notificationUnreadCount: previous.notificationUnreadCount + 1,
    }));
    updateNotification(notification);
  };

  useEffect(() => {
    socket.current = io(configKeys.SOCKET_URL);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket.current) {
      const handleChatMessage = (msg) => {
        const { taskId, ...data } = msg;
        if (data.roomId === taskSubTaskId?.subTaskId) {
          setMessages((previous) => [...previous, data]);
          setSelectedProject((previous) =>
            previous.map((task) =>
              task._id === taskId
                ? {
                    ...task,
                    subTasks: task.subTasks.map((subTask) =>
                      subTask._id === data.roomId
                        ? { ...subTask, chatUnreadCount: 0, isChatExists: true }
                        : subTask
                    ),
                  }
                : task
            )
          );
        } else {
          setSelectedProject((previous) =>
            previous.map((task) =>
              task._id === taskId
                ? {
                    ...task,
                    subTasks: task.subTasks.map((subTask) =>
                      subTask._id === data.roomId
                        ? {
                            ...subTask,
                            chatUnreadCount: subTask.chatUnreadCount + 1,
                            isChatExists: true,
                          }
                        : subTask
                    ),
                  }
                : task
            )
          );
        }
      };

      socket.current.on("chatMessage", handleChatMessage);
      return () => {
        socket.current.off("chatMessage", handleChatMessage);
      };
    }
  }, [taskSubTaskId]);

  useEffect(() => {
    if (socket.current) {
      if (socketMessage?._id) {
        socket.current.emit("chatMessage", socketMessage);
      }
    }
  }, [socketMessage]);

  // Realtime  Project updations

  const updateProjectAddHeader = (selected, header) =>
    selected.map((task) => ({ ...task, headers: [...task.headers, header] }));

  const updateProjectAddTask = (selected, updation) => [
    { ...updation, subTasks: [] },
    ...selected,
  ];
  const updateProjectRemoveTask = (selected, taskId) =>
    selected.filter((task) => task._id !== taskId);

  const updateProjectAddSubTask = (selected, updation) =>
    selected.map((singleTask) =>
      singleTask._id === updation.taskId
        ? {
            ...singleTask,
            subTasks: [...singleTask.subTasks, updation.subTask],
          }
        : singleTask
    );

  const updateProjectRemoveSubTask = (selected, updation) =>
    selected.map((task) => {
      if (task._id === updation.taskId) {
        const updated = task.subTasks.filter(
          (subTask) => !updation.removedSubTasks.includes(subTask._id)
        );
        return { ...task, subTasks: updated };
      } else {
        return task;
      }
    });

  const updateProjectTaskName = (selected, updation) =>
    selected.map((task) =>
      task._id === updation.taskId
        ? {
            ...task,
            name: updation.taskName,
          }
        : task
    );

  const update = (selected, updation) =>
    selected.map((task) =>
      task._id === updation.taskId
        ? {
            ...task,
            subTasks: task.subTasks.map((subTasks) =>
              subTasks._id === updation.subTaskId
                ? { ...subTasks, [updation.field]: updation.value }
                : subTasks
            ),
          }
        : task
    );

  const updatePeopleProject = (selected, updation) =>
    selected.map((task) =>
      task._id === updation.taskId
        ? {
            ...task,
            subTasks: task.subTasks.map((subTasks) =>
              subTasks._id === updation.subTaskId
                ? {
                    ...subTasks,
                    [updation.field]: updation.type
                      ? [...subTasks.people, updation.value]
                      : subTasks.people.filter(
                          (user) => user._id !== updation.value._id
                        ),
                  }
                : subTasks
            ),
          }
        : task
    );

  useEffect(() => {
    if (socket.current) {
      socket.current.emit("headerWidth-updation", liveUpdationHeaders);
      updateNotification(liveUpdationHeaders.notification);
    }
  }, [liveUpdationHeaders]);

  useEffect(() => {
    if (socket.current) {
      const handleHeadersUpdated = (data) => {
        triggerNotification(data.notification);
        setHeaders((previous) =>
          previous.map((header) =>
            header.key === data.key ? { ...header, width: data.width } : header
          )
        );
      };
      socket.current.on("headerWidth-updated", handleHeadersUpdated);
      return () => {
        socket.current.off("headerWidth-updated", handleHeadersUpdated);
      };
    }
  }, []);

  useEffect(() => {
    if (socket.current && liveUpdationAddRemoveProject?.project?._id) {
      socket.current.emit(
        "addRemoveProject-updation",
        liveUpdationAddRemoveProject
      );
      updateNotification(liveUpdationAddRemoveProject.notification);
    }
  }, [liveUpdationAddRemoveProject]);

  useEffect(() => {
    if (socket.current) {
      const handleAddRemoveProjectUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (projects.length) {
          if (updation.isAdded) {
            setProjects((previous) => [updation.project, ...previous]);
          } else {
            setProjects((previous) =>
              previous.filter((project) => project._id !== updation.project._id)
            );
          }
        }
      };
      socket.current.on(
        "addRemoveProject-updated",
        handleAddRemoveProjectUpdated
      );
      return () => {
        socket.current.off(
          "addRemoveProject-updated",
          handleAddRemoveProjectUpdated
        );
      };
    }
  }, [projects]);

  useEffect(() => {
    if (socket.current && liveUpdationEditProject?.projectId) {
      socket.current.emit("editProject-updation", liveUpdationEditProject);
      updateNotification(liveUpdationEditProject.notification);
    }
  }, [liveUpdationEditProject]);

  useEffect(() => {
    if (socket.current) {
      const handleEditProjectUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (projects.length) {
          setProjects((previous) =>
            previous.map((project) =>
              project._id === updation.projectId
                ? { ...project, name: updation.value }
                : project
            )
          );
        }
      };
      socket.current.on("editProject-updated", handleEditProjectUpdated);
      return () => {
        socket.current.off("editProject-updated", handleEditProjectUpdated);
      };
    }
  }, [projects]);

  useEffect(() => {
    if (socket.current && liveUpdationAddHeader?.projectId?.length) {
      socket.current.emit("addHeader-updation", liveUpdationAddHeader);
      updateNotification(liveUpdationAddHeader.notification);
    }
  }, [liveUpdationAddHeader]);

  useEffect(() => {
    if (socket.current) {
      const handleAddHeaderUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectAddHeader(previous, updation.header)
            );
            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectAddHeader(previous, updation.header)
              );
            }
          }
        }
      };
      socket.current.on("addHeader-updated", handleAddHeaderUpdated);
      return () => {
        socket.current.off("addHeader-updated", handleAddHeaderUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationAddTask?.projectId?.length) {
      socket.current.emit("addTask-updation", liveUpdationAddTask);
      updateNotification(liveUpdationAddTask.notification);
    }
  }, [liveUpdationAddTask]);

  useEffect(() => {
    if (socket.current) {
      const handleAddTaskUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectAddTask(previous, updation.task)
            );

            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectAddTask(previous, updation.task)
              );
            }
          }
        }
      };
      socket.current.on("addTask-updated", handleAddTaskUpdated);
      return () => {
        socket.current.off("addTask-updated", handleAddTaskUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationRemoveTask?.projectId?.length) {
      socket.current.emit("removeTask-updation", liveUpdationRemoveTask);
      updateNotification(liveUpdationRemoveTask.notification);
    }
  }, [liveUpdationRemoveTask]);

  useEffect(() => {
    if (socket.current) {
      const handleRemoveTaskUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectRemoveTask(previous, updation.taskId)
            );
            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectRemoveTask(previous, updation.taskId)
              );
            }
          }
        }
      };
      socket.current.on("removeTask-updated", handleRemoveTaskUpdated);
      return () => {
        socket.current.off("removeTask-updated", handleRemoveTaskUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationAddSubTask?.projectId?.length) {
      socket.current.emit("addSubTask-updation", liveUpdationAddSubTask);
      updateNotification(liveUpdationAddSubTask.notification);
    }
  }, [liveUpdationAddSubTask]);

  useEffect(() => {
    if (socket.current) {
      const handleAddSubTaskUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectAddSubTask(previous, updation)
            );

            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectAddSubTask(previous, updation)
              );
            }
          }
        }
      };
      socket.current.on("addSubTask-updated", handleAddSubTaskUpdated);
      return () => {
        socket.current.off("addSubTask-updated", handleAddSubTaskUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationRemoveSubTask?.projectId?.length) {
      socket.current.emit("removeSubTask-updation", liveUpdationRemoveSubTask);
      updateNotification(liveUpdationRemoveSubTask.notification);
    }
  }, [liveUpdationRemoveSubTask]);

  useEffect(() => {
    if (socket.current) {
      const handleRemoveSubTaskUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectRemoveSubTask(previous, updation)
            );
            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectRemoveSubTask(previous, updation)
              );
            }
          }
        }
      };
      socket.current.on("removeSubTask-updated", handleRemoveSubTaskUpdated);
      return () => {
        socket.current.off("removeSubTask-updated", handleRemoveSubTaskUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationTaskName?.projectId?.length) {
      socket.current.emit("taskName-updation", liveUpdationTaskName);
      updateNotification(liveUpdationTaskName.notification);
    }
  }, [liveUpdationTaskName]);

  useEffect(() => {
    if (socket.current) {
      const handleTaskNameUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updateProjectTaskName(previous, updation)
            );
            if (!isFiltered) {
              setSelectedProject((previous) =>
                updateProjectTaskName(previous, updation)
              );
            }
          }
        }
      };
      socket.current.on("taskName-updated", handleTaskNameUpdated);
      return () => {
        socket.current.off("taskName-updated", handleTaskNameUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationSubTaskName?.projectId?.length) {
      socket.current.emit("subTaskName-updation", liveUpdationSubTaskName);
      updateNotification(liveUpdationSubTaskName.notification);
    }
  }, [liveUpdationSubTaskName]);

  useEffect(() => {
    if (socket.current) {
      const handleSubTaskNameUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) => update(previous, updation));
            if (!isFiltered) {
              setSelectedProject((previous) => update(previous, updation));
            }
          }
        }
      };
      socket.current.on("subTaskName-updated", handleSubTaskNameUpdated);
      return () => {
        socket.current.off("subTaskName-updated", handleSubTaskNameUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationSubTaskNotes?.projectId?.length) {
      socket.current.emit("subTaskNotes-updation", liveUpdationSubTaskNotes);
      updateNotification(liveUpdationSubTaskNotes.notification);
    }
  }, [liveUpdationSubTaskNotes]);

  useEffect(() => {
    if (socket.current) {
      const handleSubTaskNotesUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) => update(previous, updation));
            if (!isFiltered) {
              setSelectedProject((previous) => update(previous, updation));
            }
          }
        }
      };
      socket.current.on("subTaskNotes-updated", handleSubTaskNotesUpdated);
      return () => {
        socket.current.off("subTaskNotes-updated", handleSubTaskNotesUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationStatusPriority?.projectId?.length) {
      socket.current.emit(
        "subTaskStatusPriority-updation",
        liveUpdationStatusPriority
      );
      updateNotification(liveUpdationStatusPriority.notification);
    }
  }, [liveUpdationStatusPriority]);

  useEffect(() => {
    if (socket.current) {
      const handleSubTaskStatusPriorityUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) => update(previous, updation));
            if (!isFiltered) {
              setSelectedProject((previous) => update(previous, updation));
            }
          }
        }
      };
      socket.current.on(
        "subTaskStatusPriority-updated",
        handleSubTaskStatusPriorityUpdated
      );
      return () => {
        socket.current.off(
          "subTaskStatusPriority-updated",
          handleSubTaskStatusPriorityUpdated
        );
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationSubTaskPeople?.projectId?.length) {
      socket.current.emit("subTaskPeople-updation", liveUpdationSubTaskPeople);
      updateNotification(liveUpdationSubTaskPeople.notification);
    }
  }, [liveUpdationSubTaskPeople]);

  useEffect(() => {
    if (socket.current) {
      const handleSubTaskPeopleUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        toast.success(
          `${notification.assignerName} ${notification.notification}`
        );

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) =>
              updatePeopleProject(previous, updation)
            );

            if (!isFiltered) {
              setSelectedProject((previous) =>
                updatePeopleProject(previous, updation)
              );
            }
          }
        }
      };
      socket.current.on("subTaskPeople-updated", handleSubTaskPeopleUpdated);
      return () => {
        socket.current.off("subTaskPeople-updated", handleSubTaskPeopleUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationDate?.projectId?.length) {
      socket.current.emit("dueDate-updation", liveUpdationDate);
      updateNotification(liveUpdationDate.notification);
    }
  }, [liveUpdationDate]);

  useEffect(() => {
    if (socket.current) {
      const handleSubTaskDueDateUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) => update(previous, updation));
            if (!isFiltered) {
              setSelectedProject((previous) => update(previous, updation));
            }
          }
        }
      };
      socket.current.on("dueDate-updated", handleSubTaskDueDateUpdated);
      return () => {
        socket.current.off("dueDate-updated", handleSubTaskDueDateUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationDynamicField?.projectId?.length) {
      socket.current.emit("dynamicField-updation", liveUpdationDynamicField);
      updateNotification(liveUpdationDynamicField.notification);
    }
  }, [liveUpdationDynamicField]);

  useEffect(() => {
    if (socket.current) {
      const handleDynamicFieldUpdated = (data) => {
        const { notification, ...updation } = data;
        triggerNotification(notification);

        if (selectedProject.length) {
          if (selectedProject[0]?.projectId === updation.projectId) {
            setCurrentProject((previous) => update(previous, updation));
            if (!isFiltered) {
              setSelectedProject((previous) => update(previous, updation));
            }
          }
        }
      };
      socket.current.on("dynamicField-updated", handleDynamicFieldUpdated);
      return () => {
        socket.current.off("dynamicField-updated", handleDynamicFieldUpdated);
      };
    }
  }, [selectedProject, setCurrentProject, setSelectedProject]);

  useEffect(() => {
    if (socket.current && liveUpdationStatusPriorityHeader?.option?._id) {
      socket.current.emit(
        "statusPriorityHeader-updation",
        liveUpdationStatusPriorityHeader
      );
      updateNotification(liveUpdationStatusPriorityHeader.notification);
    }
  }, [liveUpdationStatusPriorityHeader]);

  useEffect(() => {
    if (socket.current) {
      const handleStatusPriorityHeaderUpdated = (data) => {
        const { notification, isStatus, option } = data;
        triggerNotification(notification);

        if (isStatus) {
          setStatusGroup((previous) => [...previous, option]);
        } else {
          setPriorityGroup((previous) => [...previous, option]);
        }
      };
      socket.current.on(
        "statusPriorityHeader-updated",
        handleStatusPriorityHeaderUpdated
      );
      return () => {
        socket.current.off(
          "statusPriorityHeader-updated",
          handleStatusPriorityHeaderUpdated
        );
      };
    }
  }, []);

  const logOut = () => {
    toast.success("Sign out success");
    localStorage.removeItem("token");
    setToken(null);
    setUser({});
    navigate("/");
  };

  const navigation = (path) => {
    navigate(path);
  };

  const resetNotificationsCount = async () => {
    const response = await resetUserNotifications();
    if (response?.status) {
      setUser((previous) => ({ ...previous, notificationUnreadCount: 0 }));
    }
  };

  const notificationDrawerHandler = () => {
    if (!openNotificationDrawer && user.notificationUnreadCount !== 0) {
      resetNotificationsCount();
    }
    setOpenNotificationDrawer((previous) => !previous);
  };

  const getUserAndNotifications = async () => {
    const [userResponse, notificationResponse] = await Promise.all([
      getUserData(),
      getAllNotifications(0),
    ]);

    if (userResponse?.status) {
      setUser(userResponse.data);
    }

    if (notificationResponse?.status) {
      setNotifications(notificationResponse.data);
    }
  };

  const getMoreNotifications = async () => {
    setScrollToBottomValue(false);
    const response = await getAllNotifications(notifications.length);
    if (response?.status) {
      setNotifications((previous) => [...previous, ...response.data]);
    }
  };

  useEffect(() => {
    getUserAndNotifications();
  }, []);

  const handleScroll = () => {
    if (
      scrollRef.current.scrollHeight-2 <= scrollRef.current.scrollTop + scrollRef.current.clientHeight
    ) {
      setScrollToBottomValue(true)
    } else {
      setScrollToBottomValue(false)
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="p-3 bg-white fixed top-0 z-50 w-full flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img className="h-7 w-7 object-cover" src={Mainlogo} alt="" />
        <h1 className="text-base font-normal">work management</h1>
      </div>
      <div className="flex gap-5 items-center">
        <button
          onClick={notificationDrawerHandler}
          className="relative outline-none"
        >
          <IoNotificationsOutline className="h-6 w-6" />
          {user.notificationUnreadCount > 0 && (
            <div className="absolute -top-2 -right-1 bg-green-400 w-5 h-5 rounded-full grid place-content-center">
              <p className="text-white text-xs">
                {user.notificationUnreadCount}
              </p>
            </div>
          )}
        </button>

        <Drawer
          placement="right"
          overlay={false}
          open={openNotificationDrawer}
          onClose={notificationDrawerHandler}
          className="pl-1 pt-1 pb-12 shadow-xl border-l"
        >
          <IconButton
            className="mb-1"
            variant="text"
            color="blue-gray"
            onClick={notificationDrawerHandler}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
          <div
            ref={scrollRef}
            className="cursor-default flex flex-col gap-1 overflow-y-scroll h-full pr-1 pb-6"
          >
            {notifications.length ? (
              notifications.map((notificationData, index) => (
                <div
                  key={notificationData?._id ?? index}
                  className="flex gap-2 px-2 py-1 items-center bg-gray-100 rounded"
                >
                  <Avatar
                    variant="circular"
                    alt="Profile Photo"
                    src={notificationData?.assignerImg ?? "/avatar-icon.jpg"}
                    className="w-10 h-10"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="capitalize leading-5">
                      {notificationData?.assignerName === user.userName
                        ? "You"
                        : notificationData?.assignerName}{" "}
                      {notificationData?.notification}
                    </p>
                    <p className="text-blue-gray-500 font-normal text-sm">
                      {moment(notificationData?.createdAt)
                        .startOf("seconds")
                        .fromNow()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No notifications</p>
            )}

            {notifications.length && scrollToBottomValue ? (
              <p
                onClick={getMoreNotifications}
                className="absolute bottom-1 right-1/2 translate-x-1/2 cursor-pointer text-sm p-1 px-2 bg-maingreen bg-opacity-60 hover:bg-opacity-100 border rounded-full shadow hover:shadow-xl"
              >
                Read more
              </p>
            ) : null}
          </div>
        </Drawer>

        <Menu placement="bottom-end">
          <MenuHandler>
            <button className="outline-none">
              <img
                className="h-7 w-7 object-cover rounded-full"
                src={user?.profilePhotoURL ?? Mainlogo}
                alt="Profile Photo"
              />
            </button>
          </MenuHandler>
          <MenuList className="p-1 min-w-fit w-28 flex flex-col gap-1">
            <MenuItem
              onClick={() => navigation("/profile")}
              className={`text-black px-2 p-1 ${
                pathname === "/profile" && "bg-maingreen hover:bg-maingreenhvr"
              }`}
            >
              Profile
            </MenuItem>

            {user.role === configKeys.ADMIN_ROLE && (
              <MenuItem
                onClick={() => navigation("/permissions")}
                className={`text-black hover:bg-[#aefe007e] px-2 p-1 ${
                  pathname === "/permissions" &&
                  "bg-maingreen hover:bg-maingreenhvr"
                }`}
              >
                Permissions
              </MenuItem>
            )}

            <MenuItem
              onClick={logOut}
              className="hover:text-red-800 text-black px-2 p-1"
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </div>
    </div>
  );
};

export default Topbar;
