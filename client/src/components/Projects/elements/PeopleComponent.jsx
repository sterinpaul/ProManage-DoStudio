import { Avatar } from "@material-tailwind/react";

export const PeopleComponent = ({ subTasks, bottomConsolidation }) => {

  const filtered = subTasks?.flatMap((singleTask) => singleTask.people);
  const unique = {};
  filtered?.forEach((task) => {
    if (!unique[task?._id]) {
      unique[task._id] = task;
    }
  });
  const peopleArray = Object.values(unique);

  return (
    <td className={`${bottomConsolidation ? "border border-blue-gray-200" : "border-l"} w-32`}>
      <div className="w-fit m-auto -space-x-4 relative">
        {peopleArray?.length > 2 ? (
          <>
            <Avatar
              className="w-8 h-8 border border-black hover:z-10 focus:z-10"
              src={peopleArray[0]?.profilePhotoURL ?? "/avatar-icon.jpg"}
              alt="ProfilePhoto"
              size="sm"
              loading="lazy"
            />
            <Avatar
              className="w-8 h-8 border border-black hover:z-10 focus:z-10"
              src={peopleArray[1]?.profilePhotoURL ?? "/avatar-icon.jpg"}
              alt="ProfilePhoto"
              size="sm"
              loading="lazy"
            />
            <div className="absolute -right-3.5 top-2 text-xs text-black">
              +{peopleArray.length - 2}
            </div>
          </>
        ) : (
          peopleArray?.map((person) => (
            <Avatar
              key={person._id}
              className="w-6 h-6 border border-black hover:z-10 focus:z-10"
              src={person.profilePhotoURL ?? "/avatar-icon.jpg"}
              alt="ProfilePhoto"
              size="sm"
              loading="lazy"
            />
          ))
        )}
      </div>
    </td>
  );
};
