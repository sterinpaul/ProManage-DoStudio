import { toast } from 'react-toastify';
import baseURL from '../baseURL'


export const getAllProjects = async () => {
    try {
        const response = await baseURL.get(`/projects/getAllProjects`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching projects: ${error.message}`);
        toast.error(error.message)
    }
}

export const getSingleProject = async (projectId) => {
    try {
        const response = await baseURL.get(`/tasks/getSingleProject/${projectId}`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching project: ${error.message}`);
    }
}

export const getAllStatusOptions = async () => {
    try {
        const response = await baseURL.get(`/status/getAllStatus`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching status options: ${error.message}`);
    }
}

export const getAllPriorityOptions = async () => {
    try {
        const response = await baseURL.get(`/priority/getAllPriorities`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching priority options: ${error.message}`);
    }
}

export const getPermittedHeaders = async () => {
    try {
        const response = await baseURL.get(`/user/getPermissions`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching permissions: ${error.message}`);
    }
}

export const getAllHeaders = async () => {
    try {
        const response = await baseURL.get(`/headers/getAllHeaders`);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error fetching headers: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSingleHeaderWidth = async (key,name,width) => {
    try {
        const response = await baseURL.patch(`/headers/updateHeaderWidth`,{key,name,width});
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating header width: ${error.message}`);
        toast.error(error.message)
    }
}

export const addProject = async (projectData) => {
    try {
        const response = await baseURL.post(`/projects/addProject`, projectData);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding project: ${error.message}`);
        toast.error(error.message)
    }
}

export const addTask = async (taskData) => {
    try {
        const response = await baseURL.post(`/tasks/addTask`, taskData);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding task: ${error.message}`);
        toast.error(error.message)
    }
}

export const addSingleSubTask = async (taskId,taskName) => {
    try {
        const response = await baseURL.post(`/subTasks/addSubTask`, { taskId,taskName });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateTaskName = async (projectId,taskId, name) => {
    try {
        const response = await baseURL.patch(`/tasks/updateName`, { projectId, taskId, name });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating name: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSubTaskName = async (projectId, subTaskId, name) => {
    try {
        const response = await baseURL.patch(`/subTasks/updateName/${projectId}`, { subTaskId, name });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating name: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateSubTaskNote = async (projectId, subTaskId, notes) => {
    try {
        const response = await baseURL.patch(`/subTasks/updateNote/${projectId}`, { subTaskId, notes });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating note: ${error.message}`);
        toast.error(error.message)
    }
}

export const updateStatus = async (projectId, subTaskId, status) => {
    try {
        const response = await baseURL.patch(`/subTasks/updateStatus/${projectId}`, { subTaskId, status });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating status: ${error.message}`);
        toast.error(error.message)
    }
}

export const updatePriority = async (projectId, subTaskId, priority) => {
    try {
        const response = await baseURL.patch(`/subTasks/updatePriority/${projectId}`, { subTaskId, priority });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating priority: ${error.message}`);
        toast.error(error.message)
    }
}

export const dueDateUpdate = async (projectId, subTaskId, dueDate) => {
    try {
        const response = await baseURL.patch(`/subTasks/updateDueDate/${projectId}`, { subTaskId, dueDate });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating due date: ${error.message}`);
        toast.error(error.message)
    }
}

export const removeSubTasks = async (projectId, subTaskIds) => {
    try {
        const response = await baseURL.patch(`/subTasks/removeSubTask/${projectId}`, { subTaskIds });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error removing sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const subTaskToPerson = async (projectId, subTaskId, peopleId, assignee, isAdded) => {
    try {
        const response = await baseURL.patch(`/subTasks/assignSubTask/${projectId}`, { subTaskId, peopleId, assignee, isAdded });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error assigning sub task: ${error.message}`);
        toast.error(error.message)
    }
}

export const removeATask = async (projectId,taskId,taskName) => {
    try {
        const response = await baseURL.put(`/tasks/removeTask/${projectId}`,{taskId,taskName});
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error removing task: ${error.message}`);
        toast.error(error.message)
    }
}

export const addHeader = async (header) => {
    try {
        const response = await baseURL.post(`/headers/addHeader`, header);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding header: ${error.message}`);
        toast.error(error.message)
    }
}

export const dynamicFieldUpdate = async (projectId, subTaskId, field, value) => {
    try {
        const response = await baseURL.patch(`/subTasks/updateField/${projectId}`, { subTaskId, field, value });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating value: ${error.message}`);
        toast.error(error.message)
    }
}

export const headerDnd = async (taskId, activeHeaderId, activeIndexOrder, overHeaderId, overIndexOrder) => {
    try {
        const response = await baseURL.patch(`/tasks/dndHeaders`, { taskId, activeHeaderId, activeIndexOrder, overHeaderId, overIndexOrder });
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating dnd: ${error.message}`);
        toast.error(error.message)
    }
}

export const projectDnD = async (projectDnd) => {
    try {
        const response = await baseURL.patch(`/tasks/dndTasks`, projectDnd);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating dnd: ${error.message}`);
        toast.error(error.message)
    }
}

export const projectSubTaskDnD = async (projectSubTaskDnd) => {
    try {
        const response = await baseURL.patch(`/subTasks/dndSubTasks`, projectSubTaskDnd);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error updating dnd: ${error.message}`);
        toast.error(error.message)
    }
}

export const addDynamicStatusOption = async (projectId,option) => {
    try {
        const response = await baseURL.post(`/status/addOption/${projectId}`, option);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding option: ${error.message}`);
        toast.error(error.message)
    }
}
export const addDynamicPriorityOption = async (projectId,option) => {
    try {
        const response = await baseURL.post(`/priority/addOption/${projectId}`, option);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error(`Error adding option: ${error.message}`);
        toast.error(error.message)
    }
}