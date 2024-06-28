import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { SingleUserPermissions } from "../components/permissions/SingleUserPermissions";
import { updateSingleUserActivity } from "../api/apiConnections/adminConnections";
import { getAllUsers } from "../api/apiConnections/adminConnections";
import { Dialog } from "@material-tailwind/react";
import { PermissionProjects } from "../components/permissions/PermissionProjects";


const TABLE_HEADER = ["Sl.No.", "User Id", "Email", "Status"]

const Permissions = () => {
  const [users, setUsers] = useState([])
  const [openPermissionModal, setOpenPermissionModal] = useState(false)
  const [selectedUser,setSelectedUser] = useState({})


  const getUsers = async () => {
    const response = await getAllUsers()
    if (response?.status) {
      setUsers(response.data)
    } else {
      toast.error("No users found")
    }
  }

  useEffect(() => {
    getUsers()
  }, [])

  const updateUserActivity = async(userId,isActive,setActive)=>{
    const response = await updateSingleUserActivity(userId,isActive)
    if(response?.status){
      setActive(previous=>!previous)
    }
  }

  const permissionModalHandler = ()=>{
    setOpenPermissionModal(previous=>!previous)
  }

  const selectUserForPermission = (singleUser)=>{
    permissionModalHandler()
    setSelectedUser(singleUser)
  }


  return (
    <div className="mt-14 mr-1 mb-1 p-5 w-full h-[calc(100vh-3.8rem)] overflow-y-hidden">

      <h1 className="text-2xl font-bold">Permissions</h1>
      <p className="mt-2">Choose a user to manage their permissions</p>
      <div className="mt-6 w-full overflow-x-scroll">
        
        <table className="table-auto w-full">
          <thead>
            <tr className="border border-blue-gray-200">
              {TABLE_HEADER.map((header, index) => (
                <th key={index} className={`${index === 0 || index === TABLE_HEADER.length-1 ? "text-center" : "text-left"} p-2 text-sm bg-blue-gray-50`}>
                {header}
              </th>))}
            </tr>
          </thead>
          <tbody className="overflow-y-scroll">
            {users?.length ? users.map((singleUser, index) => {
              return (
                <SingleUserPermissions key={singleUser._id} singleUser={singleUser} index={index} updateUserActivity={updateUserActivity} selectUserForPermission={selectUserForPermission} />
              )
            }) : null}

          </tbody>
        </table>
        
      </div>
      <Dialog open={openPermissionModal} handler={permissionModalHandler} size="md">
        <PermissionProjects selectedUserId={selectedUser?._id} userPermissions={selectedUser?.permissions} permissionModalHandler={permissionModalHandler} setUsers={setUsers} />
      </Dialog>
    </div>
  )
}

export default Permissions;
