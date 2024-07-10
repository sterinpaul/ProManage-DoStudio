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
  addTask,
} from "../../api/apiConnections/projectConnections";
import { useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  allProjectsAtom,
  currentProjectAtom,
} from "../../recoil/atoms/projectAtoms";
import { editProjectName } from "../../api/apiConnections/adminConnections";

export const FormComponent = ({
  formHandler,
  projectId = "",
  currentProject = {},
}) => {
  const setProjects = useSetRecoilState(allProjectsAtom);
  const setSelectedProject = useSetRecoilState(currentProjectAtom);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: currentProject.name ?? "",
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(25, "Maximum 25 characters allowed")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      if (projectId) {
        // Adding a Task
        const taskResponse = await addTask({ projectId, ...values });
        if (taskResponse?.status) {
          formHandler();
          setSelectedProject((previous) => [
            { ...taskResponse.data, subTasks: [] },
            ...previous,
          ]);
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
          setProjects((previous) =>
            previous.map((project) =>
              project._id === currentProject._id
                ? { ...project, name: values.name }
                : project
            )
          );
          formHandler();
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

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col justify-center items-center"
    >
      <DialogHeader>
        {projectId
          ? "Add Task"
          : currentProject.name
          ? "Edit Project"
          : "Add Project"}
      </DialogHeader>
      <DialogBody className="flex flex-col gap-6">
        <div>
          <Input
            {...formik.getFieldProps("name")}
            type="text"
            label={`${projectId ? "Task" : "Project"} Name`}
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
          color="blue"
          className="w-24 rounded capitalize"
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
