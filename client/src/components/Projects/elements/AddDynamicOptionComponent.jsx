import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Input, Button, DialogFooter, Typography } from '@material-tailwind/react';
import { LoadingSpinner } from '../../Home/LoadingSpinner';
import { HexColorPicker } from 'react-colorful';
import { addDynamicPriorityOption, addDynamicStatusOption } from '../../../api/apiConnections/projectConnections';
import { liveUpdationStatusPriorityHeaderAtom } from '../../../recoil/atoms/liveUpdationAtoms';
import { useSetRecoilState } from 'recoil';


export const AddDynamicOptionComponent = ({ projectId, dynamicSelectFieldType, dynamicFieldModalHandler, setStatusGroup, setPriorityGroup }) => {
    const [addOptionError, setAddOptionError] = useState("")
    const [loading, setLoading] = useState(false)

    const setLiveUpdationStatusPriorityHeader = useSetRecoilState(liveUpdationStatusPriorityHeaderAtom);

    const loadingToggle = () => setLoading(previous => !previous)

    const formik = useFormik({
        initialValues: {
            option: '',
            color: ''
        },
        validationSchema: Yup.object().shape({
            option: Yup.string()
                .max(18, 'Maximum 18 characters allowed')
                .matches(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/, 'Only alphabets are allowed')
                .required('Required'),
            color: Yup.string().required('Choose a color'),
        }),
        onSubmit: async (values) => {
            loadingToggle()
            
                let response;
                if (dynamicSelectFieldType === "status") {
                    response = await addDynamicStatusOption(projectId,values)
                } else if (dynamicSelectFieldType === "priority") {
                    response = await addDynamicPriorityOption(projectId,values)
                }
                loadingToggle()

                if (response?.status) {
                    dynamicFieldModalHandler()
                    if (dynamicSelectFieldType === "status") {
                        setStatusGroup(previous => [...previous, response.data])
                    } else if (dynamicSelectFieldType === "priority") {
                        setPriorityGroup(previous => [...previous, response.data])
                    }
                    toast.success(response.message)
                    setLiveUpdationStatusPriorityHeader({option:response.data,isStatus:dynamicSelectFieldType === "status" ? true : false,notification:response.notification})
                } else {
                    setAddOptionError(response.message)

                    setTimeout(() => {
                        setAddOptionError("")
                    }, 3000);
                }
        }
    })

    const closeAddOptionModal = () => {
        formik.handleReset()
        dynamicFieldModalHandler()
    }

    return (
        <form onSubmit={formik.handleSubmit}>

            <div className='mt-4 flex flex-col justify-center items-center gap-3'>
                <Typography variant="h4" className=" px-8 capitalize text-center">
                    {`add ${dynamicSelectFieldType} option`}
                </Typography>

                <div>

                    <Input
                        {...formik.getFieldProps('option')}
                        type="text"
                        label="Option Name"
                        maxLength={19}
                        className="capitalize"
                        color='blue'

                    />
                    <p className="h-2 ml-2 text-xs text-red-500">{formik.touched.option && formik.errors.option ? formik.errors.option : null}</p>
                </div>

                <div className='flex flex-col items-center'>
                    <p className='text-center p-2'>Choose a background color</p>
                    <HexColorPicker color={formik.values.color} onChange={(color) => formik.setFieldValue('color', color)} />
                    <p className="h-2 ml-2 mt-2 text-xs text-red-500">{formik.touched.color && formik.errors.color ? formik.errors.color : null}</p>
                </div>

                <p className='text-red-500 text-center h-2 mb-2'>{addOptionError}</p>

            </div>
            <DialogFooter className="mx-auto text-center mb-4 flex justify-center items-center gap-4">
                <Button type="submit" disabled={loading} color="blue" className="w-24 py-2">Submit</Button>
                <Button type="button" onClick={closeAddOptionModal} color="black" className="w-24 py-2">Cancel</Button>
            </DialogFooter>
            {loading && <div className=' bg-gray-500 bg-opacity-75 rounded-lg w-full h-full flex justify-center items-center absolute z-10 bottom-1/2 translate-y-1/2'>
                <LoadingSpinner />
            </div>}

        </form>
    )
}