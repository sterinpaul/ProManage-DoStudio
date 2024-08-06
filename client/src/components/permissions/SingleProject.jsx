import { useState } from "react";
import { SinglePermission } from "./SinglePermission";
// import { Switch } from "@material-tailwind/react";

export const SingleProject = ({
  singleProject,
  permissions,
  setPermissions,
  permissionHeaders,
  index,
  projectCount
}) => {
  const [activeCheckBox, setActiveCheckBox] = useState(
    permissions?.length
      ? permissions.some((project) => project.projectId === singleProject._id)
      : false
  );
  const [permitted, setPermitted] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === singleProject._id)?.allowedPermissions?.includes("remove") ? true : false : false);


  const projectSelectionHandler = (event) => {
    if (event.target.checked) {
      setPermissions((previous) => {
        return previous.length
          ? [
              ...previous,
              { projectId: singleProject._id, allowedPermissions: [] },
            ]
          : [{ projectId: singleProject._id, allowedPermissions: [] }];
      });
    } else {
      setPermissions((previous) =>
        previous?.filter(
          (eachProject) => eachProject?.projectId !== singleProject._id
        )
      );
    }
    setActiveCheckBox((previous) => !previous);
  };

  const permissionSwitchHandler = (status, permissionType) => {
    if (status) {
      setPermissions((previous) =>
        previous.map((eachProject) =>
          eachProject.projectId === singleProject._id
            ? {
                ...eachProject,
                allowedPermissions: [
                  ...eachProject.allowedPermissions,
                  permissionType,
                ],
              }
            : eachProject
        )
      );
    } else {
      setPermissions((previous) =>
        previous.map((eachProject) =>
          eachProject.projectId === singleProject._id
            ? {
                ...eachProject,
                allowedPermissions: eachProject.allowedPermissions.filter(
                  (permission) => permission !== permissionType
                ),
              }
            : eachProject
        )
      );
    }
  };

  const permissionToggler = (event)=>{
    setPermitted(previous=>!previous)
    permissionSwitchHandler(event.target.checked,"remove")
  }


  return (
    <tr className="h-10 odd:bg-gray-100 even:bg-brown-50 hover:bg-white capitalize">
      <td className="text-center border border-blue-gray-200">
        <input
          onChange={projectSelectionHandler}
          className="cursor-pointer align-middle"
          type="checkbox"
          checked={activeCheckBox}
        />
      </td>

      <td className="border border-blue-gray-200">{singleProject.name}</td>
      <td className="border border-blue-gray-200">
        <div className="w-full flex justify-center items-center">
          <input
            onChange={permissionToggler}
            disabled={!activeCheckBox}
            color="blue"
            size="sm"
            type="checkbox"
            checked={permitted}
          />
        </div>
      </td>

      {permissionHeaders?.map((header) => (
        <SinglePermission
          key={header._id}
          header={header}
          activeCheckBox={activeCheckBox}
          projectId={singleProject._id}
          permissions={permissions}
          permissionSwitchHandler={permissionSwitchHandler}
        />
      ))}

      <td
        className={`${
          index === projectCount - 1 && "border-b"
        } border-r border-blue-gray-200`}
      ></td>
    </tr>
  );
};
