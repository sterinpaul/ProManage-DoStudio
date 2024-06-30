import HeaderModel from "../models/headers.js";


const headerHelpers = {
  addHeader: async (headerData) => {
    const newHeader = new HeaderModel(headerData)
    const savedHeader = await newHeader.save()
    const updated = savedHeader.toObject()
    delete updated.__v
    return updated
  },
  findHeaderByName: async (name) => {
    return await HeaderModel.findOne({ name },{_id:1})
  },
  findHeadersCount: async()=>{
    return await HeaderModel.countDocuments()
  },
  removeHeader: async(_id)=>{
    return await HeaderModel.deleteOne({_id})
  },
  getAllHeaders: async()=>{
    return await HeaderModel.find({},{__v:0}).sort({order:1})
  }
}

export default headerHelpers;