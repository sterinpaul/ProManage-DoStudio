import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import lodash from 'lodash'
import {
  Input,
  CardBody,
  Button,
  Typography
} from "@material-tailwind/react";
import { signUp } from './../api/apiConnections/authConnections';


export const SignUp = ({handleSignIn}) => {

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rePassword: ''
    },
    validationSchema: Yup.object().shape({
      email: Yup.string()
        .email('Invalid email address')
        .required('Required'),
      password: Yup.string()
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
          'Need one uppercase, one lowercase, one number, and one special character.')
        .min(6, 'Must be 6 characters or more')
        .max(12, 'Must be less than 13 characters')
        .required('Required'),
      rePassword: Yup.string()
        .oneOf([Yup.ref('password'), ''], 'Password does not match')
        .required('Required')
    }),
    onSubmit: async (values) => {
      const data = lodash.omit(values, 'rePassword')
      const response = await signUp(data)
      if (response?.status) {
        handleSignIn()
        toast.success(response?.message)
      } else {
        toast.error(response?.message)
      }
    }
  })

  return (
    <form onSubmit={formik.handleSubmit} className="w-100">
      <Typography variant="h3" color="blue" className="text-center pt-4">
        Sign Up
      </Typography>
      <CardBody className="flex flex-col gap-2">
        <div className='mb-4'>
          <Input type="email" id="email" size="lg" label="E-mail"
            {...formik.getFieldProps('email')} />
          <p className="h-4 ml-2 text-sm text-red-800">{formik.touched.email && formik.errors.email ?
            formik.errors.email : null}</p>
        </div>
        <div className='mb-4'>
          <Input type="password" id="password" size="lg" label="Password"
            {...formik.getFieldProps('password')} />
          <p className="h-4 ml-2 text-sm text-red-800">{formik.touched.password && formik.errors.password ?
            formik.errors.password : null}</p>
        </div>
        <Input type="password" id="rePassword" size="lg" label="Re-type Password"
          {...formik.getFieldProps('rePassword')} />
        <p className="h-4 ml-2 text-sm text-red-800">{formik.touched.rePassword && formik.errors.rePassword ?
          formik.errors.rePassword : null}</p>


        <Button type="submit" color="blue" variant="gradient" fullWidth>
          Submit
        </Button>

      </CardBody>
    </form>
  )
}
