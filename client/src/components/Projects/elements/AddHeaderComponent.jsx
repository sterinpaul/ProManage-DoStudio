import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from "react-toastify";
import { currentProjectAtom, currentProjectCopyAtom } from '../../../recoil/atoms/projectAtoms';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useState } from 'react';
import { Input, Button, DialogBody, DialogFooter, Typography } from '@material-tailwind/react';
import { addHeader } from '../../../api/apiConnections/projectConnections';
import {LoadingSpinner} from '../../Home/LoadingSpinner';
import { liveUpdationAddHeaderAtom } from '../../../recoil/atoms/liveUpdationAtoms';
import { userDataAtom } from '../../../recoil/atoms/userAtoms';


export const AddHeaderComponent = ({ projectId, addHeaderOpenHandler }) => {
    const user = useRecoilValue(userDataAtom);
    const setSelectedProject = useSetRecoilState(currentProjectAtom)
    const setCurrentProject = useSetRecoilState(currentProjectCopyAtom);
    const [addHeaderError, setAddHeaderError] = useState("")
    const [loading,setLoading] = useState(false)

    // Live Updations
    const setLiveUpdationAddHeader = useSetRecoilState(liveUpdationAddHeaderAtom)

    const formik = useFormik({
        initialValues: {
            name: ''
        },
        validationSchema: Yup.object().shape({
            name: Yup.string()
                .max(50, 'Maximum 50 characters allowed')
                .matches(/^(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/,'Only alphabets are allowed')
                .required('Required')
        }),
        onSubmit: async (values) => {
            setLoading(true)
            const headerResponse = await addHeader(values)
            setLoading(false)

            const updateProject = (selected)=>(
                selected.map(task=>({...task,headers:[...task.headers,headerResponse.data]})))
            if (headerResponse?.status) {
                setSelectedProject(previous => updateProject(previous))
                setCurrentProject(previous => updateProject(previous))
                
                setLiveUpdationAddHeader({ projectId,header: headerResponse.data, notification: {...headerResponse.notification,assignerName:user.userName,assignerImg: user.profilePhotoURL}});
                addHeaderOpenHandler()
                toast.success(headerResponse.message)
            } else {
                setAddHeaderError(headerResponse.message)

                setTimeout(() => {
                    setAddHeaderError("")
                }, 3000);
            }

        }
    })

    const closeAddHeaderModal = () => {
        if (formik.values.name) {
            formik.setFieldValue('name', '')
        }
        addHeaderOpenHandler()
    }

    return (
        <form onSubmit={formik.handleSubmit} className="mx-auto flex flex-col items-center relative">
            
            <DialogBody>
                <Typography variant="h4" className="py-4 px-8 text-center">
                    Add Header
                </Typography>

                    <div>

                        <Input
                            {...formik.getFieldProps('name')}
                            type="text"
                            label="Header Name"
                            maxLength={50}
                            className="capitalize"
                            color='blue'
                            
                        />
                        <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.name && formik.errors.name ? formik.errors.name : null}</p>
                    </div>

                <p className='text-red-500 text-center h-2'>{addHeaderError}</p>

            </DialogBody>
            <DialogFooter className="mx-auto text-center mb-4 flex justify-center items-center gap-4">
                <Button type="submit" disabled={loading} color="blue" className="w-24 py-2">Submit</Button>
                <Button type="button" onClick={closeAddHeaderModal} color="black" className="w-24 py-2">Cancel</Button>
            </DialogFooter>
            {loading && <div className=' bg-gray-500 bg-opacity-75 rounded-lg w-full h-full flex justify-center items-center absolute bottom-1/2 translate-y-1/2'>
                <LoadingSpinner />
            </div>}
             
        </form>
    )
}