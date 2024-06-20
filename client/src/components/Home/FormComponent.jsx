import { useFormik } from 'formik';
import { DialogHeader, DialogBody, DialogFooter, Button, Input } from "@material-tailwind/react";
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { addProject, addTask } from '../../api/apiConnections/projectConnections';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { allProjectsAtom, currentProjectAtom } from '../../recoil/atoms/projectAtoms';

export const FormComponent = ({ formHandler, projectId = "" }) => {
  const setProjects = useSetRecoilState(allProjectsAtom)
  const setSelectedProject = useSetRecoilState(currentProjectAtom)
  const [error, setError] = useState("")

  const formik = useFormik({
    initialValues: {
      name: '',
      description: ''
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(25, 'Maximum 25 characters allowed')
        .required('Required'),
      description: Yup.string()
        .max(150, 'Maximum 150 characters allowed')
        .required('Required')
    }),
    onSubmit: async (values) => {
      if (projectId) {
        // Adding a Task
        const taskResponse = await addTask({ projectId, ...values })
        if (taskResponse?.status) {
          formHandler()
          setSelectedProject(previous=>[{...taskResponse.data,subTasks:[]},...previous])
          toast.success(taskResponse.message)
        } else {
          setError(taskResponse.message)
          setTimeout(() => {
            setError("")
          }, 3000);
        }
      } else {
        // Adding a project
        const projectResponse = await addProject(values)
        if (projectResponse?.status) {
          formHandler()
          setProjects(previous=>[projectResponse.data,...previous])
          toast.success(projectResponse.message)
        } else {
          setError(projectResponse.message)
          setTimeout(() => {
            setError("")
          }, 3000);
        }
      }
    }
  })


  return (
    <form onSubmit={formik.handleSubmit} className='flex flex-col justify-center items-center'>
      <DialogHeader>{projectId ? "Add Task" : "Add Project"}</DialogHeader>
      <DialogBody className='flex flex-col gap-6'>
        <div>
          <Input
            {...formik.getFieldProps('name')}
            type="text"

            label={`${projectId ? "Task" : "Project"} Name`}
            className=''
          />
          <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.name && formik.errors.name ? formik.errors.name : null}</p>
        </div>
        <div>
          <Input
            {...formik.getFieldProps('description')}
            type="text"
            label="Description"
            className='h-10 p-2 outline-none border border-gray-300 rounded-md'
          />
          <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.description && formik.errors.description ? formik.errors.description : null}</p>
          <div className='text-center'>
            <p className="h-2 text-sm text-red-500">{error}</p>
          </div>
        </div>

      </DialogBody>
      <DialogFooter className='flex gap-2 items-center justify-center'>
        <Button size='md' className='w-24 rounded capitalize' type='submit'>Submit</Button>
        <Button size='md' className='w-24 rounded capitalize' type='button' onClick={formHandler}>Cancel</Button>
      </DialogFooter>
    </form>
  )
}