import mongoose from 'mongoose'
import configKeys from './configKeys.js'

const mongoDBConnect = ()=>{
    try{
        mongoose.connect(configKeys.MONGODB_ATLAS_URL).then(()=>{
            console.log('Database connected');
        })
    }catch(error){
        console.error('Database connection error',error);
        process.exit(1)
    }
}

export default mongoDBConnect