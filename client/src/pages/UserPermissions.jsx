import { useEffect, useState } from "react";
import { SingleUserPermissions } from "../components/permissions/SingleUserPermissions";
import {
  getAllUsers,
  getHeaders,
  getPermissions,
  addPermission,
  updateSingleUserActivity,
} from "../api/apiConnections/adminConnections";
import { Button, Dialog, DialogBody, Typography, DialogFooter } from "@material-tailwind/react";
import { PermissionProjects } from "../components/permissions/PermissionProjects";

const TABLE_HEADER = ["Sl.No.", "User Id", "Email", "Status"];

const UserPermissions = () => {
  const [users, setUsers] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [permissionHeaders, setPermissionHeaders] = useState([]);
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [openAddPermissionModal, setOpenAddPermissionModal] = useState(false);
  const [newPermissionData, setNewPermissionData] = useState("");

  const addConfirmationModalHandler = ()=>setOpenAddPermissionModal(previous=>!previous)

  const getData = async () => {
    const [userData, permissionData, headerData] = await Promise.all([
      getAllUsers(),
      getPermissions(),
      getHeaders(),
    ]);

    if (userData?.status) {
      setUsers(userData.data);
    }
    if (permissionData?.status) {
      setPermissionHeaders(permissionData.data);
    }
    if (headerData?.status && permissionData?.status) {
      
      if (headerData.data.length) {
        const permissionKeys = new Set(permissionData.data.map(header => header.key))
        const filteredHeadersArr = headerData.data.filter(each => !permissionKeys.has(each.key))
        setHeaders(filteredHeadersArr)
      }
    }
  }

  useEffect(() => {
    getData();
  }, []);

  
  const updateUserActivity = async (userId, isActive, setActive) => {
    const response = await updateSingleUserActivity(userId, isActive);
    if (response?.status) {
      setActive((previous) => !previous);
    }
  };

  const permissionModalHandler = () => {
    setOpenPermissionModal((previous) => !previous);
  };

  const selectUserForPermission = (singleUser) => {
    permissionModalHandler();
    setSelectedUser(singleUser);
  };

  const addPermissionHeaderModalHandler = (permissionHeader) => {
    setNewPermissionData(permissionHeader);
    addConfirmationModalHandler()
  };

  const addPermissionHeader = async()=>{
    
    const response = await addPermission(newPermissionData)
    if(response?.status){
      setPermissionHeaders(previous=>[...previous,response.data])
      setHeaders(previous=>previous.filter(header=>header.key !== newPermissionData.key))
      addConfirmationModalHandler()
    }
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
                <th
                  key={index}
                  className={`${
                    index === 0 || index === TABLE_HEADER.length - 1
                      ? "text-center"
                      : "text-left"
                  } p-2 text-sm bg-blue-gray-50`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="overflow-y-scroll">
            {users?.length
              ? users.map((singleUser, index) => {
                  return (
                    <SingleUserPermissions
                      key={singleUser._id}
                      singleUser={singleUser}
                      index={index}
                      updateUserActivity={updateUserActivity}
                      selectUserForPermission={selectUserForPermission}
                    />
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
      <Dialog
        open={openPermissionModal}
        handler={permissionModalHandler}
        size="md"
        className="p-2"
        dismiss={{ escapeKey: false, outsidePress: false }}
      >
        <PermissionProjects
          selectedUserId={selectedUser?._id}
          userPermissions={selectedUser?.permissions}
          permissionModalHandler={permissionModalHandler}
          setUsers={setUsers}
          permissionHeaders={permissionHeaders}
          headers={headers}
          addPermissionHeaderModalHandler={addPermissionHeaderModalHandler}
        />
      </Dialog>

      <Dialog
        open={openAddPermissionModal}
        handler={addConfirmationModalHandler}
        size="xs"
        className="text-center outline-none"
      >
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            Are you sure want to add permission ?
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button onClick={addPermissionHeader} color="blue" className="w-24 py-2">
            Yes
          </Button>
          <Button
            onClick={addConfirmationModalHandler}
            color="black"
            className="w-24 py-2"
          >
            No
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default UserPermissions;
