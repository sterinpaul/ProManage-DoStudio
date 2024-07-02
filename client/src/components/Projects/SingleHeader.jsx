import { useDraggable } from '@dnd-kit/core';
import { Droppable } from './dnd/Droppable';


export const SingleHeader = ({ classes, taskId, id, name }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `${id}@${taskId}`,
    });

    const style = transform && {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    };

    return (
        <th className={`${classes} capitalize`} >
            <Droppable id={`${id}@${taskId}`}>
                <div id={`${id}@${taskId}`} ref={setNodeRef} style={style} {...listeners} {...attributes}>
                    {name}
                </div>
            </Droppable>
        </th>
    )
}