import { useState } from "react";
// import { Switch } from "@material-tailwind/react";

export const SinglePermission = ({header,activeCheckBox,projectId,permissions,permissionSwitchHandler}) => {
  const [permitted, setPermitted] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === projectId)?.allowedPermissions?.includes(header.key) ? true : false : false);

  const permissionToggler = (event)=>{
    setPermitted(previous=>!previous)
    permissionSwitchHandler(event.target.checked,header.key)
  }

  return (
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
  );
};
