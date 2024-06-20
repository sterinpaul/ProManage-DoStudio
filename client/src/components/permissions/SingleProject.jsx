import { Switch } from "@material-tailwind/react"
import { useState } from "react"


export const SingleProject = ({singleProject,permissions,setPermissions}) => {
    const [dueDatePermission,setDueDatePermission] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === singleProject._id)?.allowedPermissions?.includes("dueDate") ? true : false : false)
    const [priorityPermission,setPriorityPermission] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === singleProject._id)?.allowedPermissions?.includes("priority") ? true : false : false)
    const [peopleAssignPermission,setPeopleAssignPermission] = useState(permissions?.length ? permissions.find(permissions=>permissions.projectId === singleProject._id)?.allowedPermissions?.includes("people") ? true : false : false)
    const [activeCheckBox,setActiveCheckBox] = useState(permissions?.length ? permissions.some(project=>project.projectId === singleProject._id) : false)

    const projectSelectionHandler = (event)=>{
        if(event.target.checked){
            setPermissions(previous=>{
                return previous.length ? [...previous,{projectId:singleProject._id,allowedPermissions:[]}] : [{projectId:singleProject._id,allowedPermissions:[]}]
            })
        }else{
            setPermissions(previous=>previous?.filter(eachProject=>eachProject?.projectId !== singleProject._id))
        }
        setActiveCheckBox(previous=>!previous)
    }

    const permissionSwitchHandler = (status,permissionType)=>{
        
        if(status){
            setPermissions(previous=>previous.map(eachProject=>eachProject.projectId === singleProject._id ? {...eachProject,allowedPermissions:[...eachProject.allowedPermissions,permissionType]} : eachProject))
        }else{
            setPermissions(previous=>previous.map(eachProject=>eachProject.projectId === singleProject._id ? {...eachProject,allowedPermissions:eachProject.allowedPermissions.filter(permission=>permission !== permissionType)} : eachProject))
        }

        switch (permissionType) {
            case "dueDate":
                setDueDatePermission(previous=>!previous)
                break;
            case "priority":
                setPriorityPermission(previous=>!previous)
                break;
            case "people":
                setPeopleAssignPermission(previous=>!previous)
                break;
        }
    }

    
    return (
        <tr className="h-10 odd:bg-gray-100 even:bg-brown-50 hover:bg-white capitalize">
            <td className="text-center border border-blue-gray-200">
                <input onChange={projectSelectionHandler} className="cursor-pointer" type="checkbox" checked={activeCheckBox}/>
            </td>

            <td className=" border border-blue-gray-200">{singleProject.name}</td>
            
            <td className="border border-blue-gray-200">
                <div className="w-full flex justify-center items-center">
                    <Switch onChange={(event)=>permissionSwitchHandler(event.target.checked,"dueDate")} disabled={!activeCheckBox} color="blue" size="sm" checked={dueDatePermission}></Switch>
                </div>
            </td>
            <td className="border border-blue-gray-200">
                <div className="w-full flex justify-center items-center">
                    <Switch onChange={(event)=>permissionSwitchHandler(event.target.checked,"priority")} disabled={!activeCheckBox} color="blue" size="sm" checked={priorityPermission}></Switch>
                </div>
            </td>
            <td className="border border-blue-gray-200">
                <div className="w-full flex justify-center items-center">
                    <Switch onChange={(event)=>permissionSwitchHandler(event.target.checked,"people")} disabled={!activeCheckBox} color="blue" size="sm" checked={peopleAssignPermission}></Switch>
                </div>
            </td>
        </tr>
    )
}