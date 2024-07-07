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
                        email: 1,
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
                $addFields: {
                  chatCount: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$chatCount.unreadCount",
                          0
                        ]
                      },
                      0
                    ]
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
              $filter: {
                input: "$subTasks",
                as: "subTask",
                cond: {
                  $ne: ["$$subTask._id", null]
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
            createdAt: -1
          }
        }
      ]
      // [
      //   {
      //     $match: {
      //       isActive: true,
      //       projectId
      //     }
      //   },
      //   {
      //     $lookup: {
      //       from: "subtasks",
      //       let: {
      //         taskId: "$_id"
      //       },
      //       pipeline: [
      //         {
      //           $match: {
      //             $expr: {
      //               $and: [
      //                 {
      //                   $eq: ["$taskId", "$$taskId"]
      //                 },
      //                 {
      //                   $eq: ["$isActive", true]
      //                 }
      //               ]
      //             }
      //           }
      //         },
      //         {
      //           $lookup: {
      //             from: "users",
      //             let: {
      //               peopleId: {
      //                 $cond: {
      //                   if: {
      //                     $and: [
      //                       {
      //                         $ne: ["$people", null]
      //                       },
      //                       {
      //                         $ne: ["$people", ""]
      //                       },
      //                       {
      //                         $eq: [
      //                           {
      //                             $type: "$people"
      //                           },
      //                           "string"
      //                         ]
      //                       },
      //                       {
      //                         $eq: [
      //                           {
      //                             $strLenCP: "$people"
      //                           },
      //                           24
      //                         ]
      //                       }
      //                     ]
      //                   },
      //                   then: {
      //                     $toObjectId: "$people"
      //                   },
      //                   else: null
      //                 }
      //               }
      //             },
      //             pipeline: [
      //               {
      //                 $match: {
      //                   $expr: {
      //                     $and: [
      //                       {
      //                         $ne: ["$$peopleId", null]
      //                       },
      //                       {
      //                         $eq: ["$_id", "$$peopleId"]
      //                       }
      //                     ]
      //                   }
      //                 }
      //               },
      //               {
      //                 $project: {
      //                   _id: 0,
      //                   email: 1,
      //                   profilePhotoURL: 1
      //                 }
      //               }
      //             ],
      //             as: "userDetails"
      //           }
      //         },
      //         {
      //           $lookup: {
      //             from: "unreadchats",
      //             localField: "_id",
      //             foreignField: "roomId",
      //             pipeline: [
      //               {
      //                 $match: {
      //                   userId
      //                 }
      //               },
      //               {
      //                 $project: {
      //                   _id: 0,
      //                   unreadCount: 1
      //                 }
      //               }
      //             ],
      //             as: "chatCount"
      //           }
      //         },
      //         {
      //           $unwind: {
      //             path: "$userDetails",
      //             preserveNullAndEmptyArrays: true
      //           }
      //         },
      //         {
      //           $addFields: {
      //             peopleName: "$userDetails.email",
      //             peopleImg: "$userDetails.profilePhotoURL",
      //             chatCount: {
      //               $ifNull: [
      //                 {
      //                   $arrayElemAt: [
      //                     "$chatCount.unreadCount",
      //                     0
      //                   ]
      //                 },
      //                 0
      //               ]
      //             }
      //           }
      //         },
      //         {
      //           $project: {
      //             userDetails: 0
      //           }
      //         }
      //       ],
      //       as: "subTasks"
      //     }          
      //   },
      //   {
      //     $unwind: {
      //       path: "$subTasks",
      //       preserveNullAndEmptyArrays: true
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: "$_id",
      //       projectId: { $first: "$projectId" },
      //       name: { $first: "$name" },
      //       createdAt: { $first: "$createdAt" },
      //       headers: { $first: "$headers" },
      //       subTasks: { $push: "$subTasks" }
      //     }
      //   },
      //   {
      //     $addFields: {
      //       subTasks: {
      //         $filter: {
      //           input: "$subTasks",
      //           as: "subTask",
      //           cond: { $ne: ["$$subTask._id", null] }
      //         }
      //       },
      //       headers: {
      //         $sortArray: {
      //           input: "$headers",
      //           sortBy: { order: 1 }
      //         }
      //       }
      //     }
      //   },
      //   {
      //     $sort: {
      //       createdAt: -1
      //     }
      //   }
      // ]
    )
  },
  removeTask: async (taskId) => {
    return await TaskModel.updateOne({ _id: taskId }, { $set: { isActive: false } })
  },
  addHeaderToTask: async (headerData) => {
    return await TaskModel.updateMany({ isActive: true }, { $push: { headers: headerData } })
  },
  updateHeaderDnD: async (_id,headerid,order) => {
    try {
      const headerId = new mongoose.Types.ObjectId(headerid)
      return await TaskModel.updateOne({ _id, "headers._id": headerId }, { $set: { "headers.$.order": order } })
    } catch (error) {
      console.error('Error updating header:', error);
      throw error;
    }
  }
}

export default taskHelpers;