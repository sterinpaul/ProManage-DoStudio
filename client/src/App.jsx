import "./App.css";
import { ScrollToTop } from "react-router-scroll-to-top";
// import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import { Sidebar, Topbar } from "./components";
import { tokenAtom } from "./recoil/atoms/userAtoms";
import { useRecoilValue } from 'recoil';


const Home = lazy(() => import("./pages/home"));
const SignInSignUp = lazy(() => import('./pages/SignInSignUp'))
const Projects = lazy(() => import("./pages/Projects"));
const Permissions = lazy(() => import("./pages/Permissions"));
const Error = lazy(() => import('./pages/ErrorPage'))

const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <div>
        <Topbar />
        <div className="flex">
          <Sidebar />
          <Outlet />
        </div>
      </div>
    </>
  );
};


function App() {
  const token = useRecoilValue(tokenAtom)

  const router = createBrowserRouter([
    {
      path: "/",
      element: token && <Layout />,
      children: [
        {
          path: "/",
          element: (
            <Suspense
              fallback={
                <p className="h-screen grid place-items-center">Loading....</p>
              }
            >
              {token ? <Home /> : <SignInSignUp />}
            </Suspense>
          ),
        },
        {
          path: "/projects",
          element: (
            <Suspense
              fallback={
                <p className="h-screen grid place-items-center">Loading....</p>
              }
            >
              {token ? <Projects /> : <SignInSignUp />}
            </Suspense>
          ),
        },
        {
          path: "/permissions",
          element: (
            <Suspense
              fallback={
                <p className="h-screen grid place-items-center">Loading....</p>
              }
            >
              {token ? <Permissions /> : <SignInSignUp />}
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense
              fallback={
                <p className="h-screen grid place-items-center">Loading....</p>
              }
            >
              {token ? <Error /> : <SignInSignUp />}
            </Suspense>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
