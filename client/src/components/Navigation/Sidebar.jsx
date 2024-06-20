import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight  } from "react-icons/md";
import {getAllProjects} from "../../api/apiConnections/projectConnections"
import { allProjectsAtom } from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate,useLocation } from "react-router-dom";
import { tokenAtom, userDataAtom } from "../../recoil/atoms/userAtoms";
import { toast } from "react-toastify";
import { configKeys } from "../../api/config";
import { getUserData } from "../../api/apiConnections/userConnections";


const Sidebar = () => {
  const navigate = useNavigate()
  const {pathname} = useLocation()
  const [isOpen, setIsOpen] = useState(true);
  const [openProjects, setOpenProjects] = useState(false);
  const [user,setUser] = useRecoilState(userDataAtom);
  const setToken = useSetRecoilState(tokenAtom);
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  

  const getUser = async()=>{
    const response = await getUserData()
    if (response?.status) {
      setUser(response.data)
    }
  }

  useEffect(()=>{
    getUser()
  },[])

  const getProjects = async()=>{
    setOpenProjects(!openProjects)
    if(!openProjects){
      const response = await getAllProjects()
      if(response?.status){
        setProjects(response.data)
      }
    }
  }

  const logOut = ()=>{
    toast.success("Sign out success")
    localStorage.removeItem("token")
    setToken(null)
    setUser({})
    navigate("/")
  }


  return (
    <div
      className={`text-gray-800 bg-white mt-12 h- border-r-4 relative ${
        isOpen ? "w-40 p-4" : "w-0"
      } transition-width duration-300`}
    >
      <button
        className="bg-gray-200 hover:bg-gray-300 p-1 absolute -right-8 top-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* button */}
        <div className="text-xl transition-transform duration-300">
        {isOpen ? <MdKeyboardArrowLeft/> : <MdKeyboardArrowRight/>}
        </div>
        {/* button */}
      </button>
      {isOpen && (
        <nav>
          <ul className="cursor-pointer flex flex-col gap-2">
            <li onClick={()=>navigate("/")} className={`hover:text-blue-700 ${pathname === "/" && "text-blue-700"}`}>Dashboard</li>
            <li onClick={getProjects} className={`hover:text-blue-700 ${pathname === "/projects" && "text-blue-700"}`}>Projects</li>
              {openProjects && 
                <div className="ml-3 w-40">
                  {projects?.map(singleProject=>(
                    <div key={singleProject._id} className="relative">
                      <div className="absolute -left-2 -top-3 rounded-b-lg w-1.5 h-6 border-b border-l border-black"></div>
                      <p className="capitalize whitespace-nowrap overflow-ellipsis text-sm hover:text-blue-700" onClick={()=>navigate("/projects",{state:{id:singleProject._id,name:singleProject.name,description:singleProject.description}})}>{singleProject.name}</p>
                    </div>
                  ))}
                </div>
              }
            <li className={`hover:text-blue-700 ${pathname === "/profile" && "text-blue-700"}`}>Profile</li>
            {user.role === configKeys.ADMIN_ROLE && <li onClick={()=>navigate("/permissions")} className={`hover:text-blue-700 ${pathname === "/permissions" && "text-blue-700"}`}>Permissions</li>}
            <li className={`hover:text-blue-700 ${pathname === "/settings" && "text-blue-700"}`}>Settings</li>
            <li onClick={logOut} className="hover:text-red-800">Logout</li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
