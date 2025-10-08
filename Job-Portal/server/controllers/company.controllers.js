import { Company } from "../models/Company.models.js";
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import  {asyncHandler}  from "../utils/async-handler.js";
import bcrypt from "bcrypt"
import generateToken from "../utils/generateToken.js";
import cloudinary from 'cloudinary'
import { Job } from "../models/Job.models.js";
import { JobApplication } from "../models/jobApplication.model.js";
//Register a new company
const registerCompany = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;   // text fields
    const imageFile = req.file;                   // file
     console.log(req.body); 
    
    if (!name || !email || !password || !imageFile) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Missing Details"
            )
        );
    }

    const companyExists = await Company.findOne({ email });
    if (companyExists) {
        throw new ApiError(409, "Company already registered");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt)  ;

    // Cloudinary upload
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const company = await Company.create({
        name,
        email,
        password: hashPassword,
        image: imageUpload.secure_url
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                company,
                token: generateToken(company._id)
            },
            "Company registration successful"
        )
    );
});

//company login
const loginCompany = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if company exists
  const company = await Company.findOne({ email });
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Send success response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        company: {
          _id: company._id,
          name: company.name,
          email: company.email,
          image: company.image,
          token: generateToken(company._id), // JWT token
        },
      },
      "Company login successfully"
    )
  );
});
//Get company data
const getCompanyData=asyncHandler(async(req,res)=>{
      const company=req.company
      return res.status(201)
      .json(
        new ApiResponse(
            201,
            {company},
            "get company data successfully"
        )
      )
});

//Post a new job
 const postJob = asyncHandler(async (req, res) => {
  const { title, description, location, salary, level, category } = req.body;

  // get company id from token (middleware)
  const companyId = req.company._id;

  const newJob = new Job({
    title,
    description,
    location,
    salary,
    companyId, 
    date: Date.now(),
    level,
    category,
  });

  await newJob.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      { newJob },
      "New job is created successfully"
    )
  );
});

//Get Comapny job applicants
const getCompanyJobApplicants= asyncHandler(async(req,res)=>{

});
//Get CompanyPosted Jobs
const getCompanyPostedJobs = asyncHandler(async(req,res)=>{
       const companyId= req.company._id
       const jobs= await Job.find({companyId})
       // adding No. of applicants info in data
       const jobsData= await Promise.all(jobs.map(async(job)=>{
        const applicants= await JobApplication.find({jobId: job._id});
        return {...job.toObject(),applicants:applicants.length}
       }))
       return res.status(201)
       .json(
        new ApiResponse(
            201,
            {jobsData},
            "get company posted job successfully"
        )
       )
});
//Change Job Application Status
const changeApplicationsStatus= asyncHandler(async(req,res)=>{

});
//Change job visiablity
const changeVisiblity = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const companyId = req.company?._id;

  if (!companyId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized - No company info"));
  }

  const job = await Job.findById(id);
  if (!job) {
    return res.status(404).json(new ApiResponse(404, {}, "Job not found"));
  }

  // Toggle visibility only if job belongs to the same company
  if (companyId.toString() === job.companyId.toString()) {
    job.visible = !job.visible;
    await job.save();

    return res.status(200).json(
      new ApiResponse(200, { job }, "Visibility status changed")
    );
  } else {
    return res.status(403).json(new ApiResponse(403, {}, "Forbidden - Not your job"));
  }
});

 export{
    registerCompany,
    loginCompany,
     getCompanyData,
     postJob,
     getCompanyJobApplicants,
     getCompanyPostedJobs,
     changeApplicationsStatus,
     changeVisiblity
 }