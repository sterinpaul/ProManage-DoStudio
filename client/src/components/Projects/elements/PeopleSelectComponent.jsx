import { Avatar, Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { getUsersForAssignSubTask } from "../../../api/apiConnections/userConnections";
import { userDataAtom } from "../../../recoil/atoms/userAtoms";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { assignNotifyAtom } from "../../../recoil/atoms/chatAtoms";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
} from "../../../recoil/atoms/projectAtoms";
import { BiSearchAlt2 } from "react-icons/bi";
import { subTaskToPerson } from "../../../api/apiConnections/projectConnections";

export const PeopleSelectComponent = ({
  taskSubTaskIds,
  currentSubTaskPeople,
  setCurrentSubTaskPeople,
  peopleModalHandler,
}) => {
  const user = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const [currentProject, setCurrentProject] = useRecoilState(
    currentProjectCopyAtom
  );
  const setPeopleAssignNotification = useSetRecoilState(assignNotifyAtom);
  const [allUsers, setAllUsers] = useState([]);
  const [usersForAssign, setUsersForAssign] = useState([]);

  const getAllUsers = async () => {
    const response = await getUsersForAssignSubTask();
    if (response?.status) {
      const filtered = response.data?.filter(
        (user) =>
          !currentSubTaskPeople?.some(
            (eachPerson) => eachPerson?._id === user?._id
          )
      );

      setAllUsers(filtered);
      setUsersForAssign(filtered);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const searchPerson = (event) => {
    const { value } = event.target;
    const trimmed = value.trim();

    if (trimmed.length) {
      const regex = new RegExp(`^${trimmed}`, "i");
      setAllUsers(usersForAssign.filter((each) => regex.test(each.email)));
    } else {
      setAllUsers(usersForAssign);
    }
  };

  const assignPerson = (user) => {
    setCurrentSubTaskPeople((previous) => [...previous, user]);
    const filtered = (users) =>
      users.filter((person) => person._id !== user._id);
    setAllUsers((previous) => filtered(previous));
    setUsersForAssign((previous) => filtered(previous));
  };

  const savePeople = async () => {
    const selectedPeople = currentSubTaskPeople.length
      ? currentSubTaskPeople.map((user) => user._id)
      : [];
    const response = await subTaskToPerson(
      taskSubTaskIds.subTaskId,
      selectedPeople
    );
    if (response?.status) {
      const updateProject = (selected) =>
        selected.map((task) =>
          task._id === taskSubTaskIds.taskId
            ? {
                ...task,
                subTasks: task.subTasks.map((subTask) =>
                  subTask._id === taskSubTaskIds.subTaskId
                    ? {
                        ...subTask,
                        people: [...currentSubTaskPeople],
                      }
                    : subTask
                ),
              }
            : task
        );

      setSelectedProject((previous) => updateProject(previous));

      if (currentProject.length) {
        setCurrentProject((previous) => updateProject(previous));
      }
      if (currentSubTaskPeople.length) {
        const assigner = user.email.split("@")[0];
        const assignees = currentSubTaskPeople.map(
          (user) => user.email.split("@")[0]
        ).join(",")
        setPeopleAssignNotification({ assigner, assignees });
      }

      peopleModalHandler((previous) => !previous);
    }
  };

  const removeAssign = (user) => {
    setCurrentSubTaskPeople((previous) =>
      previous.filter((person) => person._id !== user._id)
    );
    setAllUsers((previous) => [...previous, user]);
    setUsersForAssign((previous) => [...previous, user]);
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center">
        <IoMdCloseCircle
          onClick={peopleModalHandler}
          className="bg-blue-500 text-white cursor-pointer rounded-full w-6 h-6"
        />
        <Button onClick={savePeople} color="blue" className="py-2 rounded">
          Save
        </Button>
      </div>
      <div className="px-4 py-5 flex flex-col gap-2">
        <div className="flex gap-1 flex-wrap h-20">
          {currentSubTaskPeople.map((user) => {
            const userName = user.email.split("@")[0];
            return (
              <div
                key={user._id}
                className="w-14 flex flex-col justify-center gap-1 overflow-x-scroll"
              >
                <div className="relative w-fit mx-auto">
                  <Avatar
                    className="w-8 h-8 border border-blue-500"
                    src={user?.profilePhotoURL ?? "/avatar-icon.jpg"}
                    alt="ProfilePhoto"
                    size="sm"
                  />
                  <IoMdCloseCircle
                    onClick={() => removeAssign(user)}
                    className="absolute cursor-pointer bg-white rounded-full -top-2 -right-1"
                  />
                </div>
                <p className="whitespace-nowrap overflow-hidden overflow-ellipsis text-center text-xs">
                  {userName}
                </p>
              </div>
            );
          })}
        </div>

        <div className="relative">
          <input
            onChange={searchPerson}
            className="rounded-lg bg-gray-200 pl-8 border-none outline-none w-full py-1"
            placeholder="Search People"
            maxLength={25}
          />
          <BiSearchAlt2 className="absolute left-1 bottom-1/2 translate-y-1/2 w-6 h-6" />
        </div>

        <div className="h-40 overflow-y-scroll flex flex-col px-1">
          {allUsers?.length ? (
            allUsers.map((user, index) => {
              const userName = user.email.split("@")[0];
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-3 border-b py-2"
                >
                  <input
                    onClick={() => assignPerson(user)}
                    type="checkbox"
                    className="cursor-pointer"
                  />
                  <Avatar
                    className="w-7 h-7 border border-blue-500"
                    src={user?.profilePhotoURL ?? "/avatar-icon.jpg"}
                    alt="ProfilePhoto"
                    size="sm"
                  />
                  <p
                    className={`${
                      index % 3 === 0 ? "left-0" : "right-0"
                    } px-1 py-0 bg-white rounded-full text-sm`}
                  >
                    {userName}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 m-auto text-center">No users</p>
          )}
        </div>
      </div>
    </div>
  );
};
