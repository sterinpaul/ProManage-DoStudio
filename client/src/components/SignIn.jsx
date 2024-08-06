import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import {Mainlogo} from '../assets'
import {
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button
} from "@material-tailwind/react";
import { useSetRecoilState } from 'recoil';
import {tokenAtom,userDataAtom} from '../recoil/atoms/userAtoms'
import { signIn } from '../api/apiConnections/authConnections';


export const SignIn = () => {
  const setToken = useSetRecoilState(tokenAtom)
  const setUser = useSetRecoilState(userDataAtom)
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
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
        .required('Required')
    }),
    onSubmit: async (values) => {
      const response = await signIn(values)
      if (response?.status) {
        setToken(response.token)
        localStorage.setItem("token", response.token)
        setUser(response.data)
        navigate('/')
      } else {
        toast.error(response.message)
      }
    }
  })


  return (

    <form onSubmit={formik.handleSubmit}>
      <CardHeader
        variant="gradient"
        className="mb-4 bg-maingreen h-28 flex justify-center items-center text-center px-2"
      >
        <img className='h-28 w-28 object-cover' src={Mainlogo} alt="logo" loading='eager'/>

      </CardHeader>
      <CardBody className="flex flex-col gap-2">
        <div className='mb-4'>
          <Input type="email" id="email" size="lg" label="E-mail"
            {...formik.getFieldProps('email')} />
          <p className="h-4 ml-2 text-sm text-red-800">{formik.touched.email && formik.errors.email ?
            formik.errors.email : null}</p>
        </div>
        <Input type="password" label="Password" size="lg" id="password"
          {...formik.getFieldProps('password')} />
        <p className="h-4 ml-2 text-sm text-red-800">{formik.touched.password && formik.errors.password ?
          formik.errors.password : null}</p>

        <Button type="submit" className="mt-5 bg-maingreen hover:bg-maingreenhvr text-black" fullWidth>
          Sign In
        </Button>

      </CardBody>


    </form>

  )
}
