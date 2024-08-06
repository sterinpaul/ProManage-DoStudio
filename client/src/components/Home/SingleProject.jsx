import { useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { currentProjectNameAtom } from "../../recoil/atoms/projectAtoms";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import { useState } from "react";
import { userDataAtom } from "../../recoil/atoms/userAtoms";
import { configKeys } from "../../api/config";


export const SingleProject = ({ project,projectUpdationHandler }) => {
  const userData = useRecoilValue(userDataAtom);
  const setProjectName = useSetRecoilState(currentProjectNameAtom);
  const [openProjectOption, setOpenProjectOption] = useState(false);
  const navigate = useNavigate();

  const navigation = () => {
    navigate("/projects", { state: { id: project._id, name: project.name } });
    setProjectName(project.name);
  };

  const projectOpenHandler = () => {
    setOpenProjectOption((previous) => !previous);
  };

  const optionHandler = (type)=>{
    projectUpdationHandler(type,{_id:project._id,name:project.name})
    projectOpenHandler()
  }


  return (
    <div className="text-black  bg-maingreen hover:bg-maingreenhvr rounded-xl cursor-pointer group">
      <div className="flex justify-between p-1">
        <div onClick={navigation} className="h-4 w-full"></div>
        {userData.role === configKeys.ADMIN_ROLE && <Popover open={openProjectOption} handler={projectOpenHandler} placement="bottom-end">
          <PopoverHandler>
            <button className="outline-none">
              <BiDotsVerticalRounded className="w-5 h-5" />
            </button>
          </PopoverHandler>
          <PopoverContent className="rounded p-1 flex flex-col gap-1">
            <p onClick={()=>optionHandler("edit")} className="hover:bg-blue-gray-50 text-black px-2 py-1 cursor-pointer rounded transition duration-200">Edit</p>
            <p onClick={()=>optionHandler("remove")} className="hover:bg-blue-gray-50 text-black px-2 py-1 cursor-pointer rounded transition duration-200">Remove</p>
            <p onClick={()=>optionHandler("clone")} className="hover:bg-blue-gray-50 text-black px-2 py-1 cursor-pointer rounded transition duration-200">Clone</p>
          </PopoverContent>
        </Popover>}
      </div>
      <div
        onClick={navigation}
        className="w-full h-28 flex justify-center items-center"
      >
        <p className="capitalize font-semibold group-hover:scale-110 duration-300 pb-5">
          {project.name}
        </p>
      </div>
    </div>
  );
};
