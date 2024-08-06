import { useRecoilState } from "recoil";
import { ProfilePic } from "../components/Profile/ProfilePic";
import { userDataAtom } from "../recoil/atoms/userAtoms";
import { Typography } from "@material-tailwind/react";

const Profile = () => {
  const [user, setUser] = useRecoilState(userDataAtom);

  return(
    <div className="mt-16 bg-[#ffffff9c] p-8 w-full h-[calc(100vh-4.5rem)] overflow-y-hidden">
      <ProfilePic  />
      <div className="text-center m-4">
        <Typography variant="h3">
          {user.userName}
        </Typography>
        <p className="">{user.email}</p>
      </div>
    </div>
  )
}

export default Profile