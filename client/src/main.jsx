import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { ThemeProvider } from "@material-tailwind/react";
import {RecoilRoot} from 'recoil'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider>
      <RecoilRoot>
        <ToastContainer position="top-right" hideProgressBar={true} autoClose={2000} />
        <App />
      </RecoilRoot>
    </ThemeProvider>
)
