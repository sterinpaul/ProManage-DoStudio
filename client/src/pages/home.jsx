import { BiPlus,BiSearchAlt2,BiFilterAlt,BiSort } from "react-icons/bi"
import { Button, Dialog } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { allProjectsAtom } from "../recoil/atoms/projectAtoms";
import { useRecoilState } from "recoil";
import { getAllProjects } from "../api/apiConnections/projectConnections";
import { FormComponent } from "../components/Home/FormComponent";
import { useNavigate } from "react-router-dom";


const Home = () => {
  const [projects,setProjects] = useRecoilState(allProjectsAtom)
  const [isFormOpen,setIsFormOpen] = useState(false)
  const navigate = useNavigate()

  const getProjects = async()=>{
    const response = await getAllProjects()
    if(response?.status){
      setProjects(response.data)
    }
  }

  useEffect(()=>{
    getProjects()
  },[])

  const formHandler = ()=>{
    setIsFormOpen(!isFormOpen)
  }


  return (
    <div className="mt-14 mr-1 mb-1 p-5 w-full h-[calc(100vh-3.8rem)] overflow-y-hidden">
      {/* Dashboard Content */}
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <div className="mt-2 flex gap-2 h-8">
        
        <Button onClick={formHandler} className="capitalize flex items-center gap-1 transition py-1 px-2 rounded">
          <p className="hidden md:block">Add Project</p>
          <BiPlus className="w-4 h-4"/>
        </Button>
        
        <Dialog size="xs" open={isFormOpen} handler={formHandler} >
          <FormComponent formHandler={formHandler}/>
        </Dialog>

        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiSearchAlt2 />
          <p className="hidden md:block">Search</p>
        </button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiFilterAlt />
          <p className="hidden md:block">Filter</p>
        </button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:bg-blue-200 focus:bg-blue-200 hover:shadow-md py-1 px-2 rounded">
          <BiSort />
          <p className="hidden md:block">Sort</p>
        </button>
      </div>


      {/* Projects Table */}
      <div className="mt-4 overflow-y-scroll h-[calc(100vh-13rem)]">
        <div className="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects?.map((singleProject)=>(
            <div 
              key={singleProject._id} 
              onClick={()=>navigate("/projects",{state:{id:singleProject._id,name:singleProject.name,description:singleProject.description}})} 
              className="capitalize flex justify-center items-center  text-center text-white bg-blue-600 py-4 rounded cursor-pointer group"
            >
              <p className="group-hover:scale-125 transition delay-100">{singleProject.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home;
