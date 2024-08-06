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
import { tokenAtom, userDataAtom } from "./recoil/atoms/userAtoms";
import { useRecoilValue } from 'recoil';
import { configKeys } from "./api/config";


const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const SignInSignUp = lazy(() => import('./pages/SignInSignUp'))
const Projects = lazy(() => import("./pages/Projects"));
const UserPermissions = lazy(() => import("./pages/UserPermissions"));
const Error = lazy(() => import('./pages/ErrorPage'))

const Layout = () => {
  return (
    <>
      <ScrollToTop />
      <div className="">
        <Topbar />
        <div className="flex mt-2">
          <Sidebar />
          <Outlet />
        </div>
      </div>
    </>
  );
};


function App() {
  const token = useRecoilValue(tokenAtom)
  const user = useRecoilValue(userDataAtom);

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
                <p className="h-screen text-center w-full grid place-items-center text-white">Loading....</p>
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
                <p className="h-screen text-center w-full grid place-items-center text-white">Loading....</p>
              }
            >
              {token ? <Projects /> : <SignInSignUp />}
            </Suspense>
          ),
        },
        {
          path: "/profile",
          element: (
            <Suspense
              fallback={
                <p className="h-screen text-center w-full grid place-items-center text-white">Loading....</p>
              }
            >
              {token ? <Profile /> : <SignInSignUp />}
            </Suspense>
          )
        },
        {
          path: "/permissions",
          element: (
            <Suspense
              fallback={
                <p className="h-screen text-center w-full grid place-items-center text-white">Loading....</p>
              }
            >
              {token ? user.role === configKeys.ADMIN_ROLE ? <UserPermissions /> : <p className="grid place-content-center w-full h-screen">Unauthorized access</p> : <SignInSignUp />}
            </Suspense>
          )
        },
        {
          path: "*",
          element: (
            <Suspense
              fallback={
                <p className="h-screen text-center w-full grid place-items-center text-white">Loading....</p>
              }
            >
              {token ? <Error /> : <SignInSignUp />}
            </Suspense>
          )
        }
      ]
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
