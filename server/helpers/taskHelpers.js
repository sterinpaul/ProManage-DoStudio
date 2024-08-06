import mongoose from "mongoose";
import TaskModel from "../models/tasks.js";


const taskHelpers = {
  addTask: async (taskData) => {
    const newTask = new TaskModel(taskData)
    return await newTask.save()
  },
  findTaskByName: async (name, projectId) => {
    return await TaskModel.findOne({ isActive: true, name, projectId })
  },
  findAllTaskByProjectId: async (projectId) => {
    return await TaskModel.find({ isActive: true, projectId },{_id:0,name:1,headers:1,order:1}).lean()
  },
  getSingleProject: async (projectid, userid) => {
    const projectId = new mongoose.Types.ObjectId(projectid)
    const userId = new mongoose.Types.ObjectId(userid)
    return await TaskModel.aggregate(
      [
        {
          $match: {
            isActive: true,
            projectId
          }
        },
        {
          $project: {
            isActive: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0
          }
        },
        {
          $lookup: {
            from: "subtasks",
            let: {
              taskId: "$_id"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$taskId", "$$taskId"]
                      },
                      {
                        $eq: ["$isActive", true]
                      }
                    ]
                  }
                }
              },
              {
                $lookup: {
                  from: "users",
                  let: {
                    peopleIds: "$people"
                  },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $in: ["$_id", "$$peopleIds"]
                        }
                      }
                    },
                    {
                      $project: {
                        userName: 1,
                        profilePhotoURL: 1
                      }
                    }
                  ],
                  as: "people"
                }
              },
              {
                $lookup: {
                  from: "unreadchats",
                  localField: "_id",
                  foreignField: "roomId",
                  pipeline: [
                    {
                      $match: {
                        userId
                      }
                    },
                    {
                      $project: {
                        _id: 0,
                        unreadCount: 1
                      }
                    }
                  ],
                  as: "chatCount"
                }
              },
              {
                $lookup:{
                  from:"chats",
                  localField: "_id",
                  foreignField:"roomId",
                  pipeline:[
                    {
                      $match:{
                        isActive:true
                      }
                    },
                    {
                      $project:{
                        _id:0,
                        isActive:1
                      }
                    }
                  ],
                  as:"chats"
                }
              },
              {
                $addFields: {
                  chatUnreadCount: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$chatCount.unreadCount",
                          0
                        ]
                      },
                      0
                    ]
                  },
                  isChatExists: {
                    $cond: {
                      if: { $gt: [{ $size: "$chats" }, 0] },
                      then: true,
                      else: false
                    }
                  }
                }
              }
            ],
            as: "subTasks"
          }
        },
        {
          $addFields: {
            subTasks: {
              $let: {
                vars: {
                  filteredSubTasks: {
                    $filter: {
                      input: "$subTasks",
                      as: "subTask",
                      cond: {
                        $ne: ["$$subTask._id", null]
                      }
                    }
                  }
                },
                in: {
                  $sortArray: {
                    input: "$$filteredSubTasks",
                    sortBy: {
                      order: 1
                    }
                  }
                }
              }
            },
            headers: {
              $sortArray: {
                input: "$headers",
                sortBy: {
                  order: 1
                }
              }
            }
          }
        },
        {
          $sort: {
            order: -1
          }
        }
      ]
    )
  },
  removeTask: async (taskId) => {
    return await TaskModel.updateOne({ _id: taskId }, { $set: { isActive: false } })
  },
  addHeaderToTask: async (headerData) => {
    return await TaskModel.updateMany({ isActive: true }, { $push: { headers: headerData } })
  },
  dndTaskUpdate: async (_id,order) => {
    try {
      return await TaskModel.updateOne({ _id }, { $set: { order } })
    } catch (error) {
      console.error('Error updating task order:', error);
      throw error;
    }
  },
  updateHeaderDnD: async (_id,headerid,order) => {
    try {
      const headerId = new mongoose.Types.ObjectId(headerid)
      return await TaskModel.updateOne({ _id, "headers._id": headerId }, { $set: { "headers.$.order": order } })
    } catch (error) {
      console.error('Error updating header:', error);
      throw error;
    }
  },
  findTasksForRemoval:async(projectId)=>{
    const tasks = await TaskModel.find({projectId},{_id:1}).lean()
    return tasks.map(task=>task._id.toString())
  },
  removeTasks:async(projectId)=>{
    return await TaskModel.updateMany({projectId},{$set:{isActive:false}})
  },
  updateTaskName:async(_id,name)=>{
    return await TaskModel.updateOne({_id},{$set:{name}})
  }
}

export default taskHelpers;