import { useDraggable } from "@dnd-kit/core";
import { Droppable } from "./dnd/Droppable";
import { useCallback, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { headerWidthActiveAtom } from "../../recoil/atoms/projectAtoms";

export const SingleHeader = ({
  classes,
  taskId,
  id,
  headerKey,
  name,
  headers,
  updateHeaderWidth,
}) => {
  const widthRef = useRef(null);
  const [headerWidthActive, setHeaderWidthActive] = useRecoilState(
    headerWidthActiveAtom
  );
  const headerWidth = headers?.find((header) => header.name === name)?.width;

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${id}@${taskId}`,
    disabled: headerWidthActive,
  });

  const style = transform && {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  };

  const handleMouseDown = useCallback((e) => {
    setHeaderWidthActive((previous) => !previous);
    const parent = widthRef.current.parentElement;
    const startPos = {
      x: e.clientX,
    };
    const styles = window.getComputedStyle(parent);
    const w = parseInt(styles.width, 10);

    const handleMouseMove = (e) => {
      const dx = e.clientX - startPos.x;
      parent.style.width = `${w + dx}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setHeaderWidthActive(false);
      updateHeaderWidth(
        headerKey,
        name,
        widthRef?.current?.parentElement?.style?.width
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    if (widthRef.current) {
      widthRef.current.addEventListener("mousedown", handleMouseDown);
    }
    return () => {
      if (widthRef.current) {
        widthRef.current.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, []);

  return name === "task" ? (
    <th
      style={{ width: `${headerWidth}` }}
      className={`${classes} sticky z-10 left-14 bg-white text-black text-base font-medium outline outline-1 outline-blue-gray-200`}
    >
      Task
      <div
        ref={widthRef}
        className="bg-transparent cursor-col-resize absolute top-0 right-0 h-full w-[0.1rem] hover:bg-green-500"
      ></div>
    </th>
  ) : (
    <th
      style={{ width: `${headerWidth}` }}
      className={`${classes} relative capitalize text-black text-base font-medium`}
    >
      <Droppable id={`${id}@${taskId}`}>
        <div
          id={`${id}@${taskId}`}
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
        >
          {name}
        </div>
      </Droppable>
      <div
        ref={widthRef}
        className="bg-transparent cursor-col-resize absolute top-0 right-0 h-full w-[0.1rem] hover:bg-green-500"
      ></div>
    </th>
  );
};
