import { FormikConsumer, useFormik } from 'formik';
import * as Yup from 'yup';
import { useSetRecoilState } from 'recoil';
import { useState } from 'react';
import { Input, Button, DialogBody, DialogFooter, Typography } from '@material-tailwind/react';
import {LoadingSpinner} from '../../Home/LoadingSpinner';
import { SketchPicker } from 'react-color';


export const AddDynamicOptionComponent = ({ dynamicSelectFieldType,dynamicFieldModalHandler }) => {
    const setStatusOptions = useSetRecoilState(statusOptionsAtom)
    const setPriorityOptions = useSetRecoilState(priorityOptionsAtom)
    const [addHeaderError, setAddHeaderError] = useState("")
    const [loading,setLoading] = useState(false)


    const formik = useFormik({
        initialValues: {
            option: '',
            color: ''
        },
        validationSchema: Yup.object().shape({
            option: Yup.string()
                .max(18, 'Maximum 18 characters allowed')
                .matches(/^(?!.*  )[A-Za-z]+(?: [A-Za-z]+)*$/,'Only alphabets are allowed')
                .required('Required'),
            color: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            setLoading(true)
            const optionResponse = await addDynamicOption(values)
            setLoading(false)

            if (optionResponse?.status) {
                setSelectedProject(previous => previous.map(task=>({...task,headers:[...task.headers,headerResponse.data]})))
                dynamicFieldModalHandler()
                toast.success(optionResponse.message)
            } else {
                setAddHeaderError(optionResponse.message)

                setTimeout(() => {
                    setAddHeaderError("")
                }, 3000);
            }

        }
    })

    const closeAddOptionModal = () => {
        formik.handleReset()
        dynamicFieldModalHandler()
    }

    return (
        <form onSubmit={formik.handleSubmit} className="mx-auto flex flex-col items-center relative">
            
            <DialogBody>
                <Typography variant="h4" className="py-4 px-8 capitalize text-center">
                    `add ${dynamicSelectFieldType} option`
                </Typography>

                    <div>

                        <Input
                            {...formik.getFieldProps('option')}
                            type="text"
                            label="Header Name"
                            maxLength={19}
                            className="capitalize"
                            color='blue'
                            
                        />
                        <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.option && formik.errors.option ? formik.errors.option : null}</p>
                    </div>
                    <div>

                        <SketchPicker color={formik.values.color} {...formik.getFieldProps('color')} />
                        <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.color && formik.errors.color ? formik.errors.color : null}</p>
                    </div>

                    <p className='text-red-500 text-center h-2'>{addHeaderError}</p>

            </DialogBody>
            <DialogFooter className="mx-auto text-center mb-4 flex justify-center items-center gap-4">
                <Button type="submit" disabled={loading} color="blue" className="w-24 py-2">Submit</Button>
                <Button type="button" onClick={closeAddOptionModal} color="black" className="w-24 py-2">Cancel</Button>
            </DialogFooter>
            {loading && <div className=' bg-gray-500 bg-opacity-75 rounded-lg w-full h-full flex justify-center items-center absolute bottom-1/2 translate-y-1/2'>
                <LoadingSpinner />
            </div>}
             
        </form>
    )
}