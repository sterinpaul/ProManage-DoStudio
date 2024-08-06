import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { CiFileOn } from "react-icons/ci";

export const SingleChat = ({
  index,
  chatCount,
  singleMessage,
  userId,
  chatRef,
  downloadFile,
  removeChatConfirmation
}) => {
  
  const editExpired =
    moment(singleMessage.createdAt).unix() <= moment().unix() - 600;

  const [openSingleChatOption, setOpenSingleChatOption] = useState(false);
  const dropdownRef = useRef(null);

  const singleChatOptionHandler = useCallback(() => {
    setOpenSingleChatOption((prev) => !prev);
  }, []);

  const downLoadAFile = useCallback(() => {
    singleChatOptionHandler();
    downloadFile(singleMessage.url, singleMessage.message);
  }, [
    singleChatOptionHandler,
    downloadFile,
    singleMessage.url,
    singleMessage.message,
  ]);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setOpenSingleChatOption(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const removeHandler = ()=>{
    removeChatConfirmation(singleMessage)
  }

  return (
    <div
      ref={index === chatCount ? chatRef : null}
      className={`p-1.5 rounded-t-3xl ${
        userId === singleMessage.sender
          ? "self-end rounded-s-3xl bg-brown-100"
          : "self-start rounded-e-3xl bg-light-blue-100"
      }`}
    >
      <div className="flex justify-between gap-1 items-center">
        <p className="px-2 font-semibold max-w-36 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {singleMessage.user}
        </p>

        <div className="relative">
          <BiDotsVerticalRounded
            onClick={singleChatOptionHandler}
            className="cursor-pointer w-5 h-5"
          />

          {openSingleChatOption && (
            <div
              ref={dropdownRef}
              className="absolute top-4 right-1 bg-white flex flex-col justify-center items-center border z-10 p-1 shadow-lg rounded max-w-52"
            >
              <div className="w-full cursor-pointer">
                {!singleMessage.type ? (
                  userId === singleMessage.sender && (
                    <div>
                      {!editExpired && (
                        <p className="p-1 px-2 text-sm hover:bg-gray-200 rounded">
                          Edit
                        </p>
                      )}
                      <p onClick={removeHandler} className="p-1 px-2 text-sm hover:bg-gray-200 rounded">
                        Delete
                      </p>
                    </div>
                  )
                ) : (
                    <>
                    {userId === singleMessage.sender && <p onClick={removeHandler} className="p-1 px-2 text-sm hover:bg-gray-200 rounded">
                        Delete
                      </p>}
                    
                  <p
                    onClick={downLoadAFile}
                    className="p-1 px-2 text-sm hover:bg-gray-200 rounded"
                  >
                    Download
                  </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {singleMessage.type ? (
        singleMessage.type === "image" ? (
          <img
            className="max-w-48 sm:max-w-96 max-h-96 rounded-lg"
            src={singleMessage.url}
            alt="Image"
          />
        ) : (
          <div className="text-center w-full cursor-default">
            <CiFileOn className="w-8 h-8 mx-auto" />
            <p className="text-black px-2 text-wrap break-words max-w-48 sm:max-w-96">
              {singleMessage.message}
            </p>
          </div>
        )
      ) : (
        <p className="text-black px-2 text-wrap break-words max-w-48 sm:max-w-96">
          {singleMessage.message}
        </p>
      )}
      <p
        className={`text-xs px-2 ${
          userId === singleMessage.sender ? "text-right" : "text-left"
        }`}
      >
        {moment(singleMessage.createdAt).startOf("seconds").fromNow()}
      </p>
    </div>
  );
};
