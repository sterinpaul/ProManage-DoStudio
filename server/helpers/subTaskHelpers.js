import SubTaskModel from "../models/subTasks.js";


const subTaskHelpers = {
    addSubTask:async(subTaskData)=>{
        try {
            const newSubTask = new SubTaskModel(subTaskData);
            return await newSubTask.save();
        } catch (error) {
            console.error('Error saving subtask:', error);
            throw error;
        }
    },
    updateSubTaskName:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{name:value.name}});
        } catch (error) {
            console.error('Error updating name:', error);
            throw error;
        }
    },
    updateSubTaskNote:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{notes:value.notes}});
        } catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    },
    updateSubTaskStatus:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{status:value.status}});
        } catch (error) {
            console.error('Error updating status:', error);
            throw error;
        }
    },
    updateSubTaskPriority:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{priority:value.priority}});
        } catch (error) {
            console.error('Error updating priority:', error);
            throw error;
        }
    },
    updateDueDate:async(value)=>{
        try {
            return await SubTaskModel.updateOne({_id:value.subTaskId},{$set:{dueDate:value.dueDate}});
        } catch (error) {
            console.error('Error updating due date:', error);
            throw error;
        }
    },
    updatePeople:async(_id,people)=>{
        try {
            return await SubTaskModel.updateOne({_id},{$set:{people}});
        } catch (error) {
            console.error('Error assigning person:', error);
            throw error;
        }
    },
    removeSubTask:async(_id)=>{
        try {
            return await SubTaskModel.updateOne({_id},{$set:{isActive:false}});
        } catch (error) {
            console.error('Error removing sub task:', error);
            throw error;
        }
    },
    removeAllSubTasks:async(taskId)=>{
        try {
            return await SubTaskModel.updateMany({taskId},{$set:{isActive:false}});
        } catch (error) {
            console.error('Error removing sub tasks:', error);
            throw error;
        }
    }
}

export default subTaskHelpers;