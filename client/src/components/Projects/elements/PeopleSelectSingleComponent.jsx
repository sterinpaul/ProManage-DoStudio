import { Avatar } from "@material-tailwind/react";
import { IoMdCloseCircle } from "react-icons/io";

export const PeopleSelectSingleComponent = ({ user, assignPerson, isAdded }) => {
  return (
    <div onClick={()=>isAdded && assignPerson(user, isAdded)} className={`${isAdded && "cursor-pointer"} min-w-10 flex flex-col justify-center gap-1`}>
      <div className="relative w-fit mx-auto">
        <Avatar
          className="w-8 h-8 border border-maingreen"
          src={user?.profilePhotoURL ?? "/avatar-icon.jpg"}
          alt="ProfilePhoto"
          size="sm"
        />
        {!isAdded && <IoMdCloseCircle
          onClick={() => assignPerson(user, isAdded)}
          className="absolute cursor-pointer bg-white rounded-full -top-2 -right-1"
        />}
      </div>
      <p className="whitespace-nowrap overflow-hidden overflow-ellipsis text-center text-xs">
        {user.userName}
      </p>
    </div>
  );
};
