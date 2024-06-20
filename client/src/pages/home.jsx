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
    <div className="flex-1 mt-14 p-5 w-96 h-[calc(100vh-3.5rem)]">
      {/* Dashboard Content */}
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <div className="mt-2 flex gap-2">
        
        <Button onClick={formHandler} className="capitalize flex items-center gap-1 transition py-1 px-2 rounded">
          Add Project
          <BiPlus className="w-4 h-4"/>
        </Button>
        
        <Dialog size="xs" open={isFormOpen} handler={formHandler} >
          <FormComponent formHandler={formHandler}/>
        </Dialog>

        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
        <BiSearchAlt2/>
          Search</button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
          <BiFilterAlt/>
          Filter</button>
        <button className="flex items-center gap-1 transition duration-150 text-slate-500 hover:text-black py-1 px-2 rounded">
          <BiSort/>
          Sort</button>
      </div>


      {/* Task Table */}
      <div>
        <div className="overflow-y-scroll mt-4 grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects?.map((singleProject)=>(
            <div 
              key={singleProject._id} 
              onClick={()=>navigate("/projects",{state:{id:singleProject._id,name:singleProject.name,description:singleProject.description}})} 
              className="capitalize text-center text-white bg-blue-600 py-4 rounded cursor-pointer group"
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
