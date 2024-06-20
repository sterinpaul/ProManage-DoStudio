import { useEffect, useState } from "react"
import { getAllProjects } from "../../api/apiConnections/projectConnections"
import { allProjectsAtom } from "../../recoil/atoms/projectAtoms";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Button, DialogBody, DialogFooter, DialogHeader } from "@material-tailwind/react";
import { SingleProject } from "./SingleProject";
import { updatePermissions } from "../../api/apiConnections/adminConnections";
import { toast } from "react-toastify";
import { allUserAtom } from "../../recoil/atoms/userAtoms";


export const PermissionProjects = ({ selectedUserId,userPermissions,permissionModalHandler }) => {
    const setUsers = useSetRecoilState(allUserAtom)
    const [projects, setProjects] = useRecoilState(allProjectsAtom);
    const [permissions,setPermissions] = useState(userPermissions)

    const getProjects = async () => {
        const response = await getAllProjects()
        if (response?.status) {
            setProjects(response.data)
        }
    }

    useEffect(() => {
        getProjects()
    }, [])

    const updateUserPermissions = async()=>{
        const updationResponse = await updatePermissions(selectedUserId,permissions)
        if(updationResponse?.status){
            setUsers(previous=>previous.map(user=>user._id === selectedUserId ? {...user,permissions} : user))
            permissionModalHandler()
            toast.success(updationResponse.message)
        }else{
            toast.error(updationResponse.message)
        }
    }

    return (
        <div>
            <DialogHeader>
                <p className="mx-auto">Permission Settings</p>
            </DialogHeader>
            <DialogBody className="overflow-x-scroll">
                <table className="w-full text-left table-auto min-w-max">
                    <thead>
                        <tr className="font-normal text-sm">
                            <th rowSpan={2} className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center">
                                Select
                            </th>
                            <th rowSpan={2} className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center">
                                Project Name
                            </th>
                            <th colSpan={3} className="p-1 border border-blue-gray-200 bg-blue-gray-50 text-center">
                                Permissions
                            </th>
                        </tr>
                        <tr className="font-normal text-sm text-center">
                            <th className="p-1 border border-blue-gray-200 bg-blue-gray-50">
                                Due Date
                            </th>
                            <th className="p-1 border border-blue-gray-200 bg-blue-gray-50">
                                Priority
                            </th>
                            <th className="p-1 border border-blue-gray-200 bg-blue-gray-50">
                                People
                            </th>
                        </tr>
                    </thead>
                    <tbody className="overflow-y-scroll">
                        {projects.length ? projects.map(singleProject => (
                            <SingleProject key={singleProject._id} singleProject={singleProject} permissions={permissions} setPermissions={setPermissions} />
                        )) : null}
                    </tbody>
                </table>
            </DialogBody>
            <DialogFooter>
                <Button onClick={updateUserPermissions} color="blue" className="p-2 rounded mx-auto">Update</Button>
            </DialogFooter>
        </div>
    )
}