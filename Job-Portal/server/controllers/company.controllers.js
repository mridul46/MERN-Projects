import { Company } from "../models/Company.models.js";
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import  {asyncHandler}  from "../utils/async-handler.js";
import bcrypt from "bcrypt"
import generateToken from "../utils/generateToken.js";
import {v2 as cloudinary}  from 'cloudinary'
import { Job } from "../models/Job.models.js";
import { JobApplication } from "../models/jobApplication.model.js";
//Register a new company
// ----------------- REGISTER COMPANY -----------------
const registerCompany = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    // Validate required text fields
    if (!name || !email || !password) {
        return res.status(400).json(new ApiResponse(400, null, "Missing required fields"));
    }

    // Check if company already exists
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
        return res.status(409).json(new ApiResponse(409, null, "Company already registered"));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Handle image upload (optional)
    let imageUrl = "";
    if (imageFile) {
        try {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path);
            imageUrl = imageUpload.secure_url;
        } catch (err) {
            console.error("Cloudinary upload failed:", err);
            return res.status(500).json(new ApiResponse(500, null, "Image upload failed"));
        }
    }

    // Create company
    const company = await Company.create({
        name,
        email,
        password: hashPassword,
        image: imageUrl
    });

    // Generate token
    const token = generateToken(company._id);

    // Send response with token inside company object
    const companyData = { ...company.toObject(), token };

    return res.status(201).json(
        new ApiResponse(
            201,
            { company: companyData },
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
    const companyId= req.company._id
    //Find job applications for the user and populate related data
    const applications= await JobApplication.find({companyId})
    .populate('userId','name image resume')
    .populate('jobId','title location category level salary')
    .exec()
    return res.status(200)
    .json(
      new ApiResponse(
        200,
        {applications},
        "get company job applicants successfully"
      )
    )
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
const changeApplicationsStatus = asyncHandler(async (req, res) => {
  const { applicationId, status } = req.body;

  // Validate input
  if (!applicationId || !status) {
    throw new ApiError(400, "Application ID and status are required");
  }

  // Validate status value
  const validStatuses = ["Pending", "Accepted", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  // Find the application
  const application = await JobApplication.findById(applicationId);
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  // Update status
  application.status = status;
  await application.save();

  return res.status(200).json(
    new ApiResponse(200, { application }, `Application status updated to ${status}`)
  );
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