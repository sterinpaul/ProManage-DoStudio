import { useRecoilState } from "recoil";
import { MdEdit } from "react-icons/md";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import "react-easy-crop/react-easy-crop.css";

import { useRef, useState } from "react";
import { Dialog, Button } from "@material-tailwind/react";
import { userDataAtom } from "../../recoil/atoms/userAtoms";
import { LoadingSpinner } from "../Home/LoadingSpinner";
import { uploadProfilePic } from "../../api/apiConnections/userConnections";



export const ProfilePic = () => {
  const [user, setUser] = useRecoilState(userDataAtom);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [imgUpload, setImgUpload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1)
  const editorRef = useRef(null);

  const handleDrop = (dropped) => {
    setImgUpload(dropped[0]);
  };

  const uploadModalHandler = () => setOpenUploadModal((previous) => !previous);

  const handleWheel = (e) => {
    // e.preventDefault()
    setZoom((prevZoom) => {
      const newZoom = prevZoom + e.deltaY * -0.01;
      return Math.min(Math.max(newZoom, 1), 3)
    })
  }

  const cancelUpload = ()=>{
    setImgUpload(null)
    setZoom(1)
    uploadModalHandler()
  }

  const updateProfilePhoto = async() => {
    setLoading(true)
    if (editorRef.current) {
        const canvas = editorRef.current.getImage().toDataURL();
        const blob = await fetch(canvas).then(res => res.blob());
        const uploadResponse = await uploadProfilePic(blob)
        setLoading(false)
        if(uploadResponse?.status){
            setUser(previous=>({...previous,profilePhotoURL:uploadResponse.data}))
            cancelUpload()
        }
    }  
  }



  return (
    <>
      <div className="mx-auto flex justify-center items-center w-52 h-52">
        <div
          onClick={uploadModalHandler}
          className="border ring-4 border-maingreen cursor-pointer rounded-full overflow-hidden relative w-52 h-52 group"
        >
          <img
            className="h-full w-full object-contain relative"
            src={user.profilePhotoURL ?? "/avatar-icon.jpg"}
            alt="Profile photo"
          />
          <div className="group-hover:opacity-50 bg-blue-gray-800 transition duration-200 absolute top-0 left-0 w-full h-full opacity-0 flex items-center justify-center">
            <MdEdit className="w-10 h-8 text-white rounded-full" />
          </div>
        </div>
      </div>

      <Dialog
        open={openUploadModal}
        handler={uploadModalHandler}
        dismiss={{ escapeKey: false, outsidePress: false }}
        size="sm"
        className="outline-none"
      >
        <div className="m-4 flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center">
              <Dropzone
                onDrop={handleDrop}
                noClick
                noKeyboard
                style={{ width: "250px", height: "250px" }}
              >

                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      {imgUpload ? <AvatarEditor
                        ref={editorRef}
                        width={250}
                        height={250}
                        image={imgUpload}
                        scale={zoom}
                        onWheel={handleWheel}
                      /> : <div style={{ width: "250px", height: "250px" }} className="flex flex-col justify-center items-center gap-2">
                      
                      <label className="bg-main hover:bg-blue-600 text-white text-center py-1 px-2 rounded cursor-pointer text-nowrap">
                        Choose
                        <input
                          className="hidden"
                          onChange={(e) => setImgUpload(e.target.files[0])}
                          name="image"
                          type="file"
                          accept=".jpg,.jpeg,.png,.bmp,.tiff,.tif,.svg,.webp,.heic"
                        />
                      </label>
      
                      <p className="h-5 text-wrap text-center px-2">
                        Allowed formats: jpg, jpeg, png, etc
                      </p>

                    </div>}
                      
                      <input {...getInputProps()} />
                    </div>
                  )}

            </Dropzone>


            <div className="flex gap-4 mt-2">
              {!loading && (
                <Button
                  onClick={updateProfilePhoto}
                  disabled={imgUpload ? false : true}
                  color="blue"
                  className="w-24 py-2"
                >
                  Upload
                </Button>
              )}
              <Button
                onClick={cancelUpload}
                color="black"
                className="w-24 py-2 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
          {loading && <div className="absolute top-0 flex justify-center items-center w-full h-full rounded-md bg-gray-600 bg-opacity-60"><LoadingSpinner /></div>}
        </div>
      </Dialog>
    </>
  );
};
