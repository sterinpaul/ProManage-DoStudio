import { Button } from "@material-tailwind/react"
import { useState } from "react"

export const SingleUserPermissions = ({singleUser,index,updateUserActivity,selectUserForPermission})=>{
    const [active,setActive] = useState(singleUser.isActive)
    const userId = singleUser.email.split("@")[0]

    const userActivityUpdationHandle = (event)=>{
        event.stopPropagation()
        updateUserActivity(singleUser._id,!active,setActive)
    }


    return(
        <tr onClick={()=>selectUserForPermission(singleUser)} className="h-12 cursor-pointer border-b border-x border-blue-gray-200 odd:bg-gray-50 even:bg-gray-100 text-blue-gray-600 hover:bg-white">
            <td className="text-center">{index+1}</td>
            <td className="">{userId}</td>
            <td className="">{singleUser.email}</td>
            <td className="text-center">
                <Button onClick={userActivityUpdationHandle} className={`${active ? "bg-blue-600" : "bg-blue-gray-600"} p-2 w-20 rounded capitalize font-normal`}>{active ? "Active" : "Inactive"}</Button>
            </td>
        </tr>
    )
}