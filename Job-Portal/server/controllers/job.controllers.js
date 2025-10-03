import { Job } from "../models/Job.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";



//get all jobs
const getJobs= asyncHandler(async(req, res)=>{
    const jobs= await Job.find({visible:true})
    .populate({path:'companyId',select:'-password'})

   return res.status(201)
   .json(
    new ApiResponse(
        201,{jobs},
        "get all jobs dispaly"
    )
   )
})

//get a single job by id
const getJobById = asyncHandler(async(req,res)=>{
   const {id} =req.params
   const job= await Job.findById(id)
   .populate({
    path:'companyId',
    select:'-password'
   })

   if(!job){
    throw new ApiError(404,"job is not found")
   }
   return res.status(201)
   .json(
    new ApiResponse(
        201,
        {job},
        "job found successfully"
    )
   )
})

export{
    getJobs,
    getJobById
}