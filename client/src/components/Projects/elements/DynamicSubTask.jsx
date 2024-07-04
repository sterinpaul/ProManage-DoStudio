import { useEffect, useRef, useState } from "react";
import { MdEdit } from "react-icons/md";
import { permittedHeadersAtom } from "../../../recoil/atoms/projectAtoms";
import { useRecoilValue } from "recoil";

export const DynamicSubTask = ({
  classes,
  dynamicValue,
  field,
  taskId,
  subTaskId,
  updateDynamicField,
  isAdmin
}) => {
  const [error, setError] = useState(false);
  const [edit, setEdit] = useState(false);
  const [value, setValue] = useState(dynamicValue ?? "");
  const inputRef = useRef(null);
  const permittedHeaders = useRecoilValue(permittedHeadersAtom)

  const isNotAllowed = permittedHeaders?.some((head) => head.key === field);
  const isAccess = isAdmin
    ? true
    : isNotAllowed
    ? projectPermitted?.allowedPermissions?.includes(field) ?? false
    : true;

  const editOpenToggle = () => {
    if(isAccess){
        if (!edit) {
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 1);
        }
        setEdit((previous) => !previous);
    }
  };

  const updateField = (event) => {
    event.preventDefault();
    if (value.trim().length) {
      updateDynamicField(taskId, subTaskId, field, value);
      editOpenToggle();
    } else {
      setError(true);
    }
  };

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      editOpenToggle();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <td
      className={`${
        error && "outline-2 outline-dashed outline-red-600"
      } ${classes} relative group cursor-pointer w-44`}
    >
      {edit ? (
        <form onSubmit={updateField}>
          <input
            ref={inputRef}
            onBlur={updateField}
            onChange={(event) => setValue(event.target.value)}
            defaultValue={value}
            type="text"
            className="capitalize w-36 bg-transparent outline-none"
            maxLength={20}
          />
          <button type="submit"></button>
        </form>
      ) : (
        <div className="max-w-44">
          <p className="whitespace-nowrap overflow-hidden overflow-ellipsis capitalize">
            {value}
          </p>
          <MdEdit
            onClick={editOpenToggle}
            className="absolute hidden right-0 top-2 group-hover:block w-4 h-4"
          />
        </div>
      )}
    </td>
  );
};
