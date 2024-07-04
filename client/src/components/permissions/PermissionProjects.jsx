import { useCallback, useEffect, useRef, useState } from "react";
import { getAllProjects } from "../../api/apiConnections/projectConnections";
import { allProjectsAtom } from "../../recoil/atoms/projectAtoms";
import { useRecoilState } from "recoil";
import { BiPlus } from "react-icons/bi";
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader
} from "@material-tailwind/react";
import { SingleProject } from "./SingleProject";
import { updatePermissions } from "../../api/apiConnections/adminConnections";
import { toast } from "react-toastify";

export const PermissionProjects = ({
  selectedUserId,
  userPermissions,
  permissionModalHandler,
  setUsers,
  permissionHeaders,
  headers,
  addPermissionHeaderModalHandler,
}) => {
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  const [permissions, setPermissions] = useState(userPermissions);
  const dropdownRef = useRef(null)
  const [openAddDropDown, setOpenAddDropDown] = useState(false);

  const addPermissionDropDownToggle = () =>
    setOpenAddDropDown((previous) => !previous);

  const getProjects = async () => {
    const response = await getAllProjects();
    if (response?.status) {
      setProjects(response.data);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        addPermissionDropDownToggle()
    }
}, [addPermissionDropDownToggle])

useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    }
}, [handleClickOutside])

  const updateUserPermissions = async () => {
    const updationResponse = await updatePermissions(
      selectedUserId,
      permissions
    );
    if (updationResponse?.status) {
      setUsers((previous) =>
        previous.map((user) =>
          user._id === selectedUserId ? { ...user, permissions } : user
        )
      );
      permissionModalHandler();
      toast.success(updationResponse.message);
    } else {
      toast.error(updationResponse.message);
    }
  };


  return (
    <div>
      <DialogHeader>
        <p className="mx-auto">Permission Settings</p>
      </DialogHeader>
      <DialogBody className="overflow-x-scroll">
        <table className="w-full text-left table-auto min-w-max">
          <thead>
            <tr className="font-normal text-sm">
              <th
                rowSpan={2}
                className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center"
              >
                Select
              </th>
              <th
                rowSpan={2}
                className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center"
              >
                Project Name
              </th>
              <th
                colSpan={permissionHeaders?.length + 1}
                className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center"
              >
                Permissions
              </th>
            </tr>
            <tr className="font-normal text-sm text-center">
              {permissionHeaders?.map((header) => (
                <th
                  key={header._id}
                  className="capitalize p-1 border border-blue-gray-200 bg-blue-gray-50"
                >
                  {header.name}
                </th>
              ))}

              <th className="p-1 border border-blue-gray-200 bg-blue-gray-50 relative">
                <BiPlus
                  onClick={addPermissionDropDownToggle}
                  className="w-5 h-5 mx-auto cursor-pointer"
                />

                {openAddDropDown && (
                  <div ref={dropdownRef} className="z-10 absolute bg-white shadow-xl rounded p-1 top-6 right-1 grid gap-1 grid-cols-2 w-max grid-flow-dense">
                    {headers?.map((header) => (
                      <div
                        key={header._id}
                        className="bg-gray-100 capitalize cursor-pointer w-20 px-1 hover:bg-gray-200"
                        onClick={() =>{
                          addPermissionHeaderModalHandler({
                            name: header.name,
                            key: header.key,
                          })
                          addPermissionDropDownToggle()
                        }}
                      >
                        {header.name}
                      </div>
                    ))}
                  </div>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="overflow-y-scroll">
            {projects.length
              ? projects.map((singleProject,index) => (
                  <SingleProject
                    key={singleProject._id}
                    singleProject={singleProject}
                    permissions={permissions}
                    setPermissions={setPermissions}
                    permissionHeaders={permissionHeaders}
                    index={index}
                    projectCount={projects.length}
                  />
                ))
              : null}
          </tbody>
        </table>
      </DialogBody>
      <DialogFooter>
        <div className="flex gap-4 mx-auto">
          <Button
            onClick={updateUserPermissions}
            color="blue"
            className="p-2 rounded mx-auto"
          >
            Update
          </Button>
          <Button
            onClick={permissionModalHandler}
            color="black"
            className="p-2 rounded mx-auto"
          >
            Cancel
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
};
