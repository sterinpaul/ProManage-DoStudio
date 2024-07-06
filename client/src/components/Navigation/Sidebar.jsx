import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { getAllProjects } from "../../api/apiConnections/projectConnections";
import { allProjectsAtom, currentProjectNameAtom } from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate, useLocation } from "react-router-dom";
import { tokenAtom, userDataAtom } from "../../recoil/atoms/userAtoms";
import { toast } from "react-toastify";
import { configKeys } from "../../api/config";
import { getUserData } from "../../api/apiConnections/userConnections";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [openProjects, setOpenProjects] = useState(false);
  const [user, setUser] = useRecoilState(userDataAtom);
  const setToken = useSetRecoilState(tokenAtom);
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  const [projectName, setProjectName] = useRecoilState(currentProjectNameAtom);

  const getUser = async () => {
    const response = await getUserData();
    if (response?.status) {
      setUser(response.data);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const getProjects = async () => {
    setOpenProjects(!openProjects);
    if (!openProjects) {
      const response = await getAllProjects();
      if (response?.status) {
        setProjects(response.data);
      }
    }
  };

  const logOut = () => {
    toast.success("Sign out success");
    localStorage.removeItem("token");
    setToken(null);
    setUser({});
    navigate("/");
  };

  const navigation = (path, data = {}) => {
    switch (path) {
      case "/projects":
      setProjectName(data.name);
        navigate(path, {
          state: {
            id: data._id,
            name: data.name,
            description: data.description,
          },
        });
        break;
      default:
        setProjectName("");
        navigate(path);
        break;
    }
  };

  return (
    <div
      className={`text-gray-800 max-h-screen mt-12 border-r-4 relative ${
        isOpen ? "min-w-36 p-4" : "w-0"
      } transition-width duration-300`}
    >
      <button
        className="bg-gray-200 hover:bg-gray-300 p-1 absolute -right-8 top-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* button */}
        <div className="text-xl transition-transform duration-300">
          {isOpen ? <MdKeyboardArrowLeft /> : <MdKeyboardArrowRight />}
        </div>
        {/* button */}
      </button>
      {isOpen && (
        <nav>
          <ul className="cursor-pointer flex flex-col gap-2">
            <li
              onClick={() => navigation("/")}
              className={`hover:text-blue-700 ${
                pathname === "/" && "text-blue-700"
              }`}
            >
              Dashboard
            </li>
            <li
              onClick={getProjects}
              className={`hover:text-blue-700 ${
                pathname === "/projects" && "text-blue-700"
              }`}
            >
              Projects
            </li>
            {openProjects && (
              <div className="ml-3 w-20">
                {projects?.map((singleProject) => (
                  <div key={singleProject._id} className="relative">
                    <div className="absolute -left-2 -top-3 rounded-b-lg w-1.5 h-6 border-b border-l border-black"></div>
                    <p
                      className={`capitalize whitespace-nowrap overflow-ellipsis text-sm hover:text-blue-700 ${
                        projectName === singleProject.name && "text-blue-700"
                      }`}
                      onClick={() => navigation("/projects", singleProject)}
                    >
                      {singleProject.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <li
              onClick={() => navigation("/profile")}
              className={`hover:text-blue-700 ${
                pathname === "/profile" && "text-blue-700"
              }`}
            >
              Profile
            </li>
            {user.role === configKeys.ADMIN_ROLE && (
              <li
                onClick={() => navigation("/permissions")}
                className={`hover:text-blue-700 ${
                  pathname === "/permissions" && "text-blue-700"
                }`}
              >
                Permissions
              </li>
            )}
            <li
              onClick={() => navigation("/settings")}
              className={`hover:text-blue-700 ${
                pathname === "/settings" && "text-blue-700"
              }`}
            >
              Settings
            </li>
            <li onClick={logOut} className="hover:text-red-800">
              Logout
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
