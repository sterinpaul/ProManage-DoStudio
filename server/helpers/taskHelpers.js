import mongoose from "mongoose";
import TaskModel from "../models/tasks.js";


const taskHelpers = {
    addTask:async(taskData)=>{
        const newTask = new TaskModel(taskData)
        return await newTask.save()
    },
    findTaskByName:async(name,projectId)=>{
        return await TaskModel.findOne({isActive:true,name,projectId})
    },
    getSingleProject:async(id)=>{
        const projectId = new mongoose.Types.ObjectId(id)
        return await TaskModel.aggregate(
          [
            {
              $match: {
                isActive: true,
                projectId
              }
            },
            {
              $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "taskId",
                as: "subTasks",
                pipeline: [
                  {
                    $match: {
                      isActive: true
                    }
                  },
                  {
                    $lookup: {
                      from: "users",
                      let: {
                        peopleId: {
                          $cond: {
                            if: {
                              $and: [
                                {
                                  $ne: ["$people", null]
                                },
                                {
                                  $ne: ["$people", ""]
                                },
                                {
                                  $eq: [
                                    {
                                      $strLenCP: "$people"
                                    },
                                    24
                                  ]
                                }
                              ]
                            },
                            then: {
                              $toObjectId: "$people"
                            },
                            else: null
                          }
                        }
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $ne: ["$$peopleId", null]
                                },
                                {
                                  $eq: [
                                    "$_id",
                                    "$$peopleId"
                                  ]
                                }
                              ]
                            }
                          }
                        },
                        {
                          $project: {
                            _id: 0,
                            email: 1,
                            profilePhotoURL: 1
                          }
                        }
                      ],
                      as: "userDetails"
                    }
                  },
                  {
                    $unwind: {
                      path: "$userDetails",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $addFields: {
                      peopleName: "$userDetails.email",
                      peopleImg:
                        "$userDetails.profilePhotoURL"
                    }
                  },
                  {
                    $project: {
                      userDetails: 0
                    }
                  }
                ]
              }
            },
            {
              $unwind: {
                path: "$subTasks",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: "$_id",
                projectId: {
                  $first: "$projectId"
                },
                name: {
                  $first: "$name"
                },
                description: {
                  $first: "$description"
                },
                createdAt: {
                  $first: "$createdAt"
                },
                subTasks: {
                  $push: {
                    $cond: [
                      {
                        $ne: ["$subTasks._id", null]
                      },
                      "$subTasks",
                      null
                    ]
                  }
                }
              }
            },
            {
              $addFields: {
                subTasks: {
                  $filter: {
                    input: "$subTasks",
                    as: "subTask",
                    cond: {
                      $ne: ["$$subTask", null]
                    }
                  }
                }
              }
            },
            {
              $sort: {
                createdAt: 1
              }
            }
          ]
        )
    },
}

export default taskHelpers;