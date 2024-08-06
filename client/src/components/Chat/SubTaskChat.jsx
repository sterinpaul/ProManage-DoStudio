import {
  Button,
  Dialog,
  DialogBody,
  Typography,
  DialogFooter,
} from "@material-tailwind/react";
import { useEffect, useRef, useState } from "react";
import { MdImage, MdClose, MdAttachFile } from "react-icons/md";
import { CiCircleRemove } from "react-icons/ci";
import {
  getSubTaskChatMessages,
  readChatUpdation,
  sendSingleMessage,
  sendSingleFile,
  getBlobFileDownload,
  removeChatMessage,
} from "../../api/apiConnections/chatConnections";
import InputEmoji from "react-input-emoji";
import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import { userDataAtom } from "../../recoil/atoms/userAtoms";
import { toast } from "react-toastify";
import {
  currentProjectAtom,
  currentProjectCopyAtom,
  taskSubTaskAtom,
} from "../../recoil/atoms/projectAtoms";
import {
  allChatMessageAtom,
  socketMessageAtom,
} from "../../recoil/atoms/chatAtoms";
import { SingleChat } from "./SingleChat";
import { LoadingSpinner } from "../Home/LoadingSpinner";

export const SubTaskChat = ({ subTaskChatModalHandler, chatExists }) => {
  const userData = useRecoilValue(userDataAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);
  const [taskSubTaskId, setTaskSubTaskId] = useRecoilState(taskSubTaskAtom);
  const [messages, setMessages] = useRecoilState(allChatMessageAtom);
  const [singleMessage, setSingleMessage] = useState("");
  const setSocketMessage = useSetRecoilState(socketMessageAtom);
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [uploadType, setUploadType] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState("");
  const [scrollTopValue, setScrollTopValue] = useState(100);

  const chatRef = useRef(null);
  const scrollRef = useRef(null);

  const [openRemoveConfirmModal, setOpenRemoveConfirmModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState({});

  const removeChatHandler = () =>
    setOpenRemoveConfirmModal((previous) => !previous);

  const removeChatConfirmation = (message) => {
    setCurrentMessage(message);
    removeChatHandler();
  };

  const updateProject = (selected, option) =>
    selected.map((task) =>
      task._id === taskSubTaskId.taskId
        ? {
            ...task,
            subTasks: task.subTasks.map((subTask) =>
              subTask._id === taskSubTaskId.subTaskId
                ? { ...subTask, isChatExists: option }
                : subTask
            ),
          }
        : task
    );

  const removeChat = async () => {
    const response = await removeChatMessage(currentMessage._id);
    removeChatHandler();
    if (response?.status) {
      if (messages.length === 1) {
        setSelectedProject((previous) => updateProject(previous, false));
        setCurrentProject((previous) => updateProject(previous, false));
      }
      setMessages((previous) =>
        previous.filter((single) => single._id !== currentMessage._id)
      );
    }
  };

  const readChats = async () => {
    const updateProject = (selected) =>
      selected.map((task) =>
        task._id === taskSubTaskId.taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask._id === taskSubTaskId.subTaskId
                  ? { ...subTask, chatUnreadCount: 0 }
                  : subTask
              ),
            }
          : task
      );

    setSelectedProject((previous) => updateProject(previous));
    setCurrentProject((previous) => updateProject(previous));

    const readUpdation = await readChatUpdation(
      userData._id,
      taskSubTaskId.subTaskId
    );
    if (!readUpdation?.status) {
      toast.error("Error in update read status");
    }
  };

  const getChatMessages = async () => {
    const response = await getSubTaskChatMessages(taskSubTaskId?.subTaskId, 0);
    if (response?.status) {
      setMessages(response.data);
    }
    readChats();
  };

  const getMoreMessages = async () => {
    const response = await getSubTaskChatMessages(
      taskSubTaskId?.subTaskId,
      messages.length
    );
    if (response?.status) {
      setMessages((previous) => [...response.data, ...previous]);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current.scrollTop <= 3) {
      scrollRef.current.scrollTop = 1;
      setScrollTopValue(scrollRef.current.scrollTop);
    } else {
      setScrollTopValue(100);
    }
  };

  useEffect(() => {
    getChatMessages();
    return () => {
      setMessages([]);
      setTaskSubTaskId({ taskId: "", subTaskId: "" });
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (chatRef.current && scrollTopValue >= 100) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const send = async () => {
    const response = await sendSingleMessage({
      roomId: taskSubTaskId.subTaskId,
      sender: userData._id,
      message: singleMessage,
    });
    if (response?.status) {
      setSocketMessage({
        ...response.data,
        user: userData.userName,
        taskId: taskSubTaskId.taskId,
      });
      setMessages((previous) => [
        ...previous,
        { ...response.data, user: userData.userName },
      ]);
      setSingleMessage("");

      if (!chatExists) {
        setSelectedProject((previous) => updateProject(previous, true));
        setCurrentProject((previous) => updateProject(previous, true));
      }
    }
  };

  const sendFile = async () => {
    setLoading(true);
    const response = await sendSingleFile(
      taskSubTaskId.subTaskId,
      userData._id,
      uploadType,
      fileUpload
    );
    setLoading(false);
    setFileUpload(null);
    if (response?.status) {
      setSocketMessage({
        ...response.data,
        user: userData.userName,
        taskId: taskSubTaskId.taskId,
      });
      setMessages((previous) => [
        ...previous,
        { ...response.data, user: userData.userName },
      ]);
      setUploadResponse("Upload success");
    } else {
      setUploadResponse("Upload failed");
    }

    setTimeout(() => {
      setUploadResponse("");
    }, 4000);
  };

  const uploadModalHandler = (fileType = "") => {
    if (openUploadModal && fileUpload) {
      setFileUpload(null);
    }
    setUploadType(fileType);
    setOpenUploadModal((previous) => !previous);
  };

  const downloadFile = async (fileUrl, fileName) => {
    const response = await getBlobFileDownload(fileUrl);
    const blob = new Blob([response], { type: response.type });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full max-h-screen flex flex-col justify-between">
      <div
        onClick={subTaskChatModalHandler}
        className="absolute z-10 group cursor-pointer right-2 top-2 rounded-full p-1 transition hover:bg-black bg-blue-gray-100 "
      >
        <MdClose className="w-4 h-4 transition text-black group-hover:text-white" />
      </div>
      <DialogBody>
        <div
          ref={scrollRef}
          className="flex w-full h-[calc(100vh-20rem)] overflow-y-scroll mt-6 flex-col items-center gap-2 rounded border border-gray-900/10 bg-gray-900/5 p-2"
        >
          {messages.length && scrollTopValue <= 5 ? (
            <p
              onClick={getMoreMessages}
              className="absolute top-12 right-1/2 translate-x-1/2 cursor-pointer text-sm p-1 px-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full shadow hover:shadow-lg"
            >
              Read more
            </p>
          ) : null}
          {messages?.length ? (
            messages.map((singleMessage, index) => {
              return (
                <SingleChat
                  key={singleMessage._id}
                  index={index}
                  chatCount={messages.length - 1}
                  singleMessage={singleMessage}
                  userId={userData._id}
                  chatRef={chatRef}
                  downloadFile={downloadFile}
                  removeChatConfirmation={removeChatConfirmation}
                />
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full h-96">
              <p>No Messages</p>
            </div>
          )}
        </div>
      </DialogBody>
      <div className="h-12 flex flex-nowrap justify-center items-center px-4 mb-4">
        <div
          onClick={() => uploadModalHandler("image")}
          className="cursor-pointer p-1 border rounded-full hover:shadow-lg bg-gray-100 group"
        >
          <MdImage className="w-5 h-5 group-hover:text-maingreenhvr" />
        </div>

        <InputEmoji
          onChange={setSingleMessage}
          value={singleMessage}
          cleanOnEnter
          onEnter={send}
          maxLength={2000}
          shouldReturn
          placeholder="Type something"
          inputClass="no-scrollbar"
        />

        <div
          onClick={() => uploadModalHandler("file")}
          className="cursor-pointer p-1 border rounded-full hover:shadow-lg bg-gray-100 group"
        >
          <MdAttachFile className="w-5 h-5 rotate-45 group-hover:text-maingreenhvr" />
        </div>
      </div>

      {/* Image or File Upload */}
      <Dialog
        open={openUploadModal}
        handler={uploadModalHandler}
        dismiss={{ escapeKey: false, outsidePress: false }}
        size="xs"
        className="outline-none"
      >
        <div className="m-4 flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            {fileUpload ? (
              <div className="relative">
                {uploadType === "image" ? (
                  <>
                    <img
                      className="max-h-96"
                      src={fileUpload && URL.createObjectURL(fileUpload)}
                    />
                    <div
                      onClick={() => setFileUpload(null)}
                      className="absolute cursor-pointer group top-0 flex justify-center items-center w-full h-full bg-opacity-0 hover:bg-opacity-50 bg-blue-gray-500"
                    >
                      <CiCircleRemove className="w-12 h-12 hidden group-hover:block text-white" />
                    </div>
                  </>
                ) : (
                  <div className="h-20 w-60 flex items-center justify-center">
                    <p className="text-center text-wrap whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {fileUpload.name}
                    </p>
                  </div>
                )}
                {loading && (
                  <div className="absolute top-0 flex justify-center items-center w-full h-full bg-gray-400 bg-opacity-70">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            ) : (
              <>
                <label className=" bg-maingreen hover:bg-maingreenhvr text-black text-center py-1 px-2 rounded cursor-pointer text-nowrap">
                  Choose {uploadType}
                  <input
                    className="hidden"
                    onChange={(e) => setFileUpload(e.target?.files?.[0])}
                    name="file"
                    type="file"
                    accept={
                      uploadType === "image"
                        ? ".jpg,.jpeg,.png,.gif,.bmp,.tiff,.tif,.svg,.webp,.heic"
                        : "application/*,audio/*,video/*,text/*"
                    }
                  />
                </label>
                {uploadType === "image" && (
                  <p className="h-5 text-wrap text-center px-2">
                    Allowed formats: jpg, jpeg, png, gif, etc
                  </p>
                )}
              </>
            )}

            {uploadResponse && (
              <p className="text-center text-blue-700">{uploadResponse}</p>
            )}

            <div className="flex gap-4 mt-2">
              {!loading && (
                <Button
                  onClick={sendFile}
                  disabled={fileUpload ? false : true}
                  className="w-24 bg-maingreen text-black py-2"
                >
                  Send
                </Button>
              )}
              <Button
                onClick={uploadModalHandler}
                color="black"
                className="w-24 py-2 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={openRemoveConfirmModal}
        handler={removeChatHandler}
        size="xs"
        className="outline-none text-center"
      >
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            {`Are you sure want to remove the chat ?`}
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button onClick={removeChat} color="red" className="w-24 py-2">
            Yes
          </Button>
          <Button
            onClick={removeChatHandler}
            color="black"
            className="w-24 py-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};
