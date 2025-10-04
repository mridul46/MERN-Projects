import mongoose, { Schema } from "mongoose";

const jobApplicationSchema= new Schema(
    {
       userId:{
        type:String,
        ref: 'User',
        required:true
       } ,
       companyId:{
        type:mongoose.Schema.Types.ObjectId ,
        ref: 'Company',
        required:true
       } ,
       jobId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required:true
       } ,
       status:{
        type:String,
        default:'Pending'
       },
       date:{
        type:Number,
        required:true,
       }

    }
)
export const JobApplication= mongoose.model('JobApplication',jobApplicationSchema)