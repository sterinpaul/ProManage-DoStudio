import React, { useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { getAllProjects } from "../../api/apiConnections/projectConnections";
import { allProjectsAtom, currentProjectNameAtom } from "../../recoil/atoms/projectAtoms";
import { useRecoilState } from "recoil";
import { useNavigate, useLocation } from "react-router-dom";


const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [openProjects, setOpenProjects] = useState(false);
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  const [projectName, setProjectName] = useRecoilState(currentProjectNameAtom);


  const getProjects = async () => {
    setOpenProjects(!openProjects);
    if (!openProjects) {
      const response = await getAllProjects();
      if (response?.status) {
        setProjects(response.data);
      }
    }
  };

  const navigation = (path, data = {}) => {
    switch (path) {
      case "/projects":
      setProjectName(data.name);
        navigate(path, {
          state: {
            id: data._id,
            name: data.name
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
      className={`text-gray-800 bg-[#ffffffcd] max-h-screen mt-16 border-r-4 relative selection:bg-transparent ${
        isOpen ? "min-w-36 p-2" : "w-0"
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
          <ul className="cursor-pointer font-medium flex flex-col gap-2">
            <li
              onClick={() => navigation("/")}
              className={`hover:text-black hover:bg-[#aefe007e]  px-2 p-1 rounded-md ${
                pathname === "/" && "text-black bg-maingreen hover:bg-maingreenhvr"
              }`}
            >
              Dashboard
            </li>
            <li
              onClick={getProjects}
              className={`hover:text-black hover:bg-[#aefe007e]  px-2 p-1 rounded-md relative ${
                pathname === "/projects" && "text-black bg-maingreen hover:bg-maingreenhvr"
              }`}
            >
              Projects
              {openProjects && projects.length ? <div className="absolute w-1 h-3 left-2 -bottom-2 border-l border-black"></div> : null}
            </li>
            {openProjects && (
              <div className="max-h-96 overflow-y-scroll no-scrollbar">
                <div className="ml-4 w-20">
                {projects?.map((singleProject) => (
                  <div key={singleProject._id} className="relative">
                    <div className="absolute -left-2 -top-3 rounded-b-lg w-1.5 h-6 border-b border-l border-black"></div>
                    <p
                      className={`capitalize whitespace-nowrap overflow-ellipsis text-sm hover:text-black ${
                        projectName === singleProject.name && "text-black"
                      }`}
                      onClick={() => navigation("/projects", singleProject)}
                    >
                      {singleProject.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
