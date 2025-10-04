import { Job } from "../models/Job.models.js";
import { JobApplication } from "../models/jobApplication.model.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import {v2 as cloudinary} from 'cloudinary'


//Get user data
const getUserData=asyncHandler(async(req,res)=>{
   const userId=req.auth.userId
   const user= await User.findById(userId)
   if(!user){
    throw new ApiError(404,"User not Found")
   }
   return res.status(201)
   .json(
    new ApiResponse(201,
        {user},
        "Get user data successfully"
    )
   )
});
//Apply for a job
const applyForJob=asyncHandler(async(req,res)=>{
    const {jobId} =req.body 
    const userId= req.auth.userId
    const isAlreadyApplied= await JobApplication.find({jobId, userId})

    if(isAlreadyApplied >0){
        throw new ApiError(409,"Already Applied")
    }
    
    const jobData= await Job.findById(jobId)
    if(!jobData){
        throw new ApiError(404,"Job Not Found")
    }

    await JobApplication.create({
        companyId:jobData.companyId,
        userId,
        jobId,
        date:Date.now()
    })

    return res.status(201)
    .json(
        new ApiResponse(201,
            {JobApplication},
            "Applied Successfully"
        )
    )
});

//Get user applied applications
const getUserJobApplications=asyncHandler(async(req,res)=>{
    const userId=req.auth.userId
    const applications=(await JobApplication.find({userId})).
    populate('companyId','name email image')
    .populate('jobId','title description location category level salary')
    .exec()

    if(!applications){
        throw new ApiError(404,"No job applications found for this user")
    }
    return res.status(201)
    .json(
        new ApiResponse(201,
            {applications},
            "display your applied applications "
        )
    )
});


//update user(resume)
const updateUserResume=asyncHandler(async(req,res)=>{
    const userId= req.auth.userId
    const resumeFile=req.resumeFile 
    const userData= await User.findById(userId)
    
    if(resumeFile){
        const resumeUpload= await cloudinary.uploader.upload(resumeFile.path)
        userData.resume=resumeUpload.secure_url
    }
    await userData.save()
    return res.status(201)
    .json(
        201,
        {userData},
        "Resume Updated"
    )

});
export{
    getUserData,
    getUserJobApplications,
    applyForJob,
    updateUserResume
}