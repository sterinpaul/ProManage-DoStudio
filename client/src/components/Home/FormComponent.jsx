import { useFormik } from "formik";
import * as Yup from "yup";
import {
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
} from "@material-tailwind/react";
import { toast } from "react-toastify";
import {
  addProject,
  addSingleSubTask,
  addTask,
} from "../../api/apiConnections/projectConnections";
import { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  allProjectsAtom,
  currentProjectAtom,
  currentProjectCopyAtom,
} from "../../recoil/atoms/projectAtoms";
import { editProjectName } from "../../api/apiConnections/adminConnections";
import {
  liveUpdationAddRemoveProjectAtom,
  liveUpdationAddSubTaskAtom,
  liveUpdationAddTaskAtom,
  liveUpdationEditProjectAtom,
} from "../../recoil/atoms/liveUpdationAtoms";


export const FormComponent = ({
  user,
  formHandler,
  projectId = "",
  taskId="",
  currentProject = {}
}) => {
  const setProjects = useSetRecoilState(allProjectsAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Live Updations
  const setLiveUpdationAddRemoveProject = useSetRecoilState(
    liveUpdationAddRemoveProjectAtom
  );
  const setLiveUpdationEditProject = useSetRecoilState(
    liveUpdationEditProjectAtom
  );
  const setLiveUpdationAddTask = useSetRecoilState(liveUpdationAddTaskAtom);
  const setLiveUpdationAddSubTask = useSetRecoilState(
    liveUpdationAddSubTaskAtom
  );

  const formik = useFormik({
    initialValues: {
      name: currentProject.name ?? ""
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(50, "Maximum 50 characters allowed")
        .required("Required")
    }),
    onSubmit: async (values) => {
      if (taskId) {
        // Adding a Sub-Task
        const subTaskResponse = await addSingleSubTask(taskId,values.name);
        if (subTaskResponse?.status) {
          formHandler();
          const updateProject = (selected) =>
            selected.map((singleTask) =>
              singleTask._id === taskId
                ? {
                    ...singleTask,
                    subTasks: [...singleTask.subTasks, subTaskResponse.data],
                  }
                : singleTask
            );
          setSelectedProject((previous) => updateProject(previous));
          setCurrentProject((previous) => updateProject(previous));
  
          setLiveUpdationAddSubTask({
            projectId,
            taskId,
            subTask: subTaskResponse.data,
            notification: subTaskResponse.notification,
          });
        
      } else {
        setError(subTaskResponse.message);
        setTimeout(() => {
          setError("");
        }, 3000);
      }

      } else if (projectId) {
        // Adding a Task
        const update = (selected) => [
          { ...taskResponse.data, subTasks: [] },
          ...selected
        ];

        const taskResponse = await addTask({ projectId, ...values });
        if (taskResponse?.status) {
          formHandler();
          setSelectedProject((previous) => update(previous));

          setCurrentProject((previous) => update(previous));

          setLiveUpdationAddTask({
            projectId,
            task: taskResponse.data,
            notification: {
              ...taskResponse.notification,
              assignerName: user.userName,
              assignerImg: user.profilePhotoURL,
            },
          });
          toast.success(taskResponse.message);
        } else {
          setError(taskResponse.message);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      } else if (currentProject?.name) {
        // Edit project name
        const editResponse = await editProjectName({
          _id: currentProject._id,
          name: values.name,
        });
        if (editResponse?.status) {
          formHandler();
          setProjects((previous) =>
            previous.map((project) =>
              project._id === currentProject._id
                ? { ...project, name: values.name }
                : project
            )
          );
          setLiveUpdationEditProject({
            projectId: currentProject._id,
            value: values.name,
            notification: {
              ...editResponse.notification,
              assignerName: user.userName,
              assignerImg: user.profilePhotoURL
            },
          });
        } else {
          setError(editResponse.message);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      } else {
        // Adding a project
        const projectResponse = await addProject(values);
        if (projectResponse?.status) {
          formHandler();
          setProjects((previous) => [projectResponse.data, ...previous]);
          setLiveUpdationAddRemoveProject({
            project: projectResponse.data,
            isAdded:true,
            notification: {
              ...projectResponse.notification,
              assignerName: user.userName,
              assignerImg: user.profilePhotoURL,
            }
          });
          toast.success(projectResponse.message);
        } else {
          setError(projectResponse.message);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      }
    },
  });

  useEffect(() => {
    const inputFocus = setTimeout(() => {
      if(inputRef.current){
        inputRef.current.focus();
      }
    }, 500);
    return()=>clearTimeout(inputFocus)
  }, []);


  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col justify-center items-center"
    >
      <DialogHeader>
        {taskId ? "Add Sub-task" : projectId
          ? "Add Task"
          : currentProject.name
          ? "Edit Project"
          : "Add Project"}
      </DialogHeader>
      <DialogBody className="flex flex-col gap-6">
        <div>
          <Input
            inputRef={inputRef}
            {...formik.getFieldProps("name")}
            type="text"
            label={`${taskId ? "Sub-task" : projectId ? "Task" : "Project"} Name`}
            className="capitalize"
          />
          <p className="h-2 ml-2 text-xs text-red-500">
            {formik.touched.name && formik.errors.name
              ? formik.errors.name
              : null}
          </p>

          <div className="text-center">
            <p className="h-2 text-sm text-red-500">{error}</p>
          </div>
        </div>
      </DialogBody>
      <DialogFooter className="flex gap-2 items-center justify-center">
        <Button
          size="md"
          className="w-24 bg-maingreen hover:bg-maingreenhvr rounded capitalize"
          type="submit"
        >
          Submit
        </Button>
        <Button
          size="md"
          className="w-24 rounded capitalize"
          type="button"
          onClick={formHandler}
        >
          Cancel
        </Button>
      </DialogFooter>
    </form>
  );
};
