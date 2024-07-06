import { useRecoilState } from "recoil";
import { ProfilePic } from "../components/Profile/ProfilePic";
import { userDataAtom } from "../recoil/atoms/userAtoms";
import { Typography } from "@material-tailwind/react";

const Profile = () => {
  const [user, setUser] = useRecoilState(userDataAtom);
  const userName = user?.email.split("@")[0].toUpperCase()

  return(
    <div className="mt-14 mr-1 mb-1 p-8 w-full h-[calc(100vh-3.8rem)] overflow-y-hidden">
      <ProfilePic  />
      <div className="text-center m-4">
        <Typography variant="h3">
          {userName}
        </Typography>
        <p className="text-gray-600">{user.email}</p>
      </div>
    </div>
  )
}

export default Profile