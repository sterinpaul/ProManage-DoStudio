import { BiPlus, BiSearchAlt2, BiFilterAlt, BiSort } from "react-icons/bi";
import { Button, Dialog, DialogBody, DialogFooter, Typography } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { allProjectsAtom } from "../recoil/atoms/projectAtoms";
import { useRecoilState } from "recoil";
import { getAllProjects } from "../api/apiConnections/projectConnections";
import { FormComponent } from "../components/Home/FormComponent";
import { SingleProject } from "../components/Home/SingleProject";
import { removeAProject } from "../api/apiConnections/adminConnections";
import { toast } from "react-toastify";

const Home = () => {
  const [projects, setProjects] = useRecoilState(allProjectsAtom);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [openRemoveConfirmModal, setOpenRemoveConfirmModal] = useState(false);
  const [currentProject, setCurrentProject] = useState({_id:"",name:""});

  const getProjects = async () => {
    const response = await getAllProjects();
    if (response?.status) {
      setProjects(response.data);
    }
  };

  useEffect(() => {
    getProjects();
  }, []);

  const formHandler = () => {
    if(currentProject?.name){
      setCurrentProject({_id:"",name:""})
    }
    setIsFormOpen(!isFormOpen);
  };

  const removeProjectHandler = ()=>setOpenRemoveConfirmModal(previous=>!previous)

  const projectUpdationHandler = (type,projectData)=>{
    setCurrentProject(projectData)
    if(type === "edit"){
      formHandler()
    }else if(type === "remove"){
      removeProjectHandler()
    }
  }

  const removeProject = async()=>{
    removeProjectHandler()
    const response = await removeAProject(currentProject._id)
    if(response?.status){
      setProjects(previous=>previous.filter(project=>project._id !== currentProject._id))
      toast.success("Project removed")
    }else{
      toast.error("Removal failed")
    }
  }

  return (
    <div className="mt-14 mr-1 mb-1 p-5 w-full h-[calc(100vh-3.8rem)] overflow-y-hidden">
      {/* Dashboard Content */}
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      <div className="mt-2 flex gap-2 h-8">
        <Button
          onClick={formHandler}
          className="capitalize flex items-center gap-1 transition py-1 px-2 rounded"
        >
          <p className="hidden md:block">Add Project</p>
          <BiPlus className="w-4 h-4" />
        </Button>

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
          {projects?.map((project) => (
            <SingleProject key={project._id} project={project} projectUpdationHandler={projectUpdationHandler} />
          ))}
        </div>
      </div>

      {/* Add Project Form */}
      <Dialog size="xs" open={isFormOpen} handler={formHandler}>
        <FormComponent formHandler={formHandler} currentProject={currentProject} />
      </Dialog>

      <Dialog
        open={openRemoveConfirmModal}
        handler={removeProjectHandler}
        size="xs"
        className="outline-none text-center"
      >
        <DialogBody>
          <Typography variant="h4" className="pt-4 px-8">
            {`Are you sure want to remove the project ?`}
          </Typography>
        </DialogBody>
        <DialogFooter className="mx-auto text-center flex justify-center items-center gap-4">
          <Button
            onClick={removeProject}
            color="red"
            className="w-24 py-2"
          >
            Yes
          </Button>
          <Button
            onClick={removeProjectHandler}
            color="black"
            className="w-24 py-2"
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

    </div>
  );
};

export default Home;
