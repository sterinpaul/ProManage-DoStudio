import { Switch } from "@material-tailwind/react";
import { useState } from "react";

export const SinglePermission = ({header,activeCheckBox,projectId,permissions,permissionSwitchHandler}) => {
  const [permitted, setPermitted] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === projectId)?.allowedPermissions?.includes(header.key) ? true : false : false);

  const permissionToggler = (event)=>{
    setPermitted(previous=>!previous)
    permissionSwitchHandler(event.target.checked,header.key)
  }

  return (
    <td className="border border-blue-gray-200">
      <div className="w-full flex justify-center items-center">
        <Switch
          onChange={permissionToggler}
          disabled={!activeCheckBox}
          color="blue"
          size="sm"
          checked={permitted}
        ></Switch>
      </div>
    </td>
  );
};
