import { useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { getUsersForAssignSubTask } from "../../../api/apiConnections/userConnections";
import { userDataAtom } from "../../../recoil/atoms/userAtoms";
import { useRecoilValue, useSetRecoilState } from "recoil";

import {
  currentProjectAtom,
  currentProjectCopyAtom,
} from "../../../recoil/atoms/projectAtoms";
import { BiSearchAlt2 } from "react-icons/bi";
import { subTaskToPerson } from "../../../api/apiConnections/projectConnections";
import { liveUpdationSubTaskPeopleAtom } from "../../../recoil/atoms/liveUpdationAtoms";
import { PeopleSelectSingleComponent } from "./PeopleSelectSingleComponent";

export const PeopleSelectComponent = ({
  projectId,
  taskSubTaskIds,
  currentSubTaskPeople,
  setCurrentSubTaskPeople,
  peopleModalHandler
}) => {
  const userData = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);

  const [allUsers, setAllUsers] = useState([]);
  const [usersForAssign, setUsersForAssign] = useState([]);

  // Live Updations
  const setLiveUpdationSubTaskPeople = useSetRecoilState(
    liveUpdationSubTaskPeopleAtom
  );

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

    if (value.length) {
      const regex = new RegExp(`^${value}`, "i");
      setAllUsers(usersForAssign.filter((each) => regex.test(each.userName)));
    } else {
      setAllUsers(usersForAssign);
    }
  };
  
    const updateProject = (selected,user,isAdded) =>
      selected.map((task) =>
        task._id === taskSubTaskIds.taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask._id === taskSubTaskIds.subTaskId
                  ? {
                      ...subTask,
                      people: isAdded ? [...subTask.people,user] : subTask.people.filter(userData=>userData._id !== user._id),
                    }
                  : subTask
              ),
            }
          : task
      );

  const assignPerson = async(user,isAdded) => {
    const filtered = (users) => users.filter((person) => person._id !== user._id);

    if(isAdded){
      setCurrentSubTaskPeople((previous) => [...previous, user]);
      setAllUsers((previous) => filtered(previous));
      setUsersForAssign((previous) => filtered(previous));
    }else{
      setCurrentSubTaskPeople((previous) => filtered(previous))
      setAllUsers((previous) => [...previous, user]);
      setUsersForAssign((previous) => [...previous, user]);
    }
    
    const response = await subTaskToPerson(projectId, taskSubTaskIds.subTaskId, user._id,user.userName,isAdded);

    if(response?.status){

      setSelectedProject((previous) => updateProject(previous,user,isAdded));
      setCurrentProject((previous) => updateProject(previous,user,isAdded));
      
      setLiveUpdationSubTaskPeople({
        projectId,
        ...taskSubTaskIds,
        field: "people",
        value: user,
        type:isAdded,
        notification: {
          ...response.notification,
          assignerName: userData.userName,
          assignerImg: userData.profilePhotoURL
        },
      });
    }
  };


  return (
    <div className="p-2 xl:p-5">
      <div className="flex justify-end items-center">
        <IoMdCloseCircle
          onClick={peopleModalHandler}
          className="bg-gray-600 hover:bg-red-400 duration-200 text-white cursor-pointer rounded-full w-6 h-6"
        />
      </div>
      <div className="px-4 flex flex-col gap-2">
        <div className="flex py-3 gap-2 h-20 overflow-x-scroll no-scrollbar">
        
        {currentSubTaskPeople?.length ? (
          currentSubTaskPeople?.map((user) => {
            return <PeopleSelectSingleComponent key={user._id} user={user} assignPerson={assignPerson} isAdded={false} />
          })
        ) : (
          <p className="text-gray-500 m-auto text-center">Choose people</p>
        )}
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

        
        <div className="flex py-3 gap-2 h-20 overflow-x-scroll no-scrollbar">
          {allUsers?.length ? (
            allUsers.map((user) => {
              return <PeopleSelectSingleComponent key={user._id} user={user} assignPerson={assignPerson} isAdded={true} />
            })
          ) : (
            <p className="text-gray-500 m-auto text-center">No users</p>
          )}
        </div>
      </div>
    </div>
  );
};
