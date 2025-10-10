import { Job } from "../models/Job.models.js";
import { JobApplication } from "../models/jobApplication.model.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { v2 as cloudinary } from "cloudinary";
import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// --- Helper: Get or create user ---
const getOrCreateUser = async (userId) => {
  const cUser = await clerk.users.getUser(userId);

  // Use Clerk's email if available, otherwise fallback
  const email =
    cUser.email_addresses?.length > 0 && cUser.email_addresses[0].email_address
      ? cUser.email_addresses[0].email_address
      : `no-email-${userId}@example.com`;

  // Use Clerk's full name
  const name = cUser.name || "Unknown User";

  // Use Clerk image or placeholder
  const image = cUser.image_url || "https://via.placeholder.com/150";

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    // Create new user
    user = await User.create({
      _id: cUser.id,
      clerkId: cUser.id,
      email,
      name,
      image,
      resume: "",
    });
    console.log("Created new user in MongoDB:", user.email);
  } else {
    // Update existing user if info changed
    let updated = false;
    if (user.email !== email) {
      user.email = email;
      updated = true;
    }
    if (user.name !== name) {
      user.name = name;
      updated = true;
    }
    if (user.image !== image) {
      user.image = image;
      updated = true;
    }
    if (updated) {
      await user.save();
      console.log("Updated existing user in MongoDB:", user.email);
    }
  }

  return user;
};

// --- Get user data ---
const getUserData = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const user = await getOrCreateUser(userId);
  return res.status(200).json(new ApiResponse(200, { user }, "User data fetched successfully"));
});

// --- Apply for a job ---
const applyForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  const { userId } = req.auth();
  const user = await getOrCreateUser(userId);

  const alreadyApplied = await JobApplication.findOne({ jobId, userId: user.clerkId });
  if (alreadyApplied) throw new ApiError(409, "Already applied");

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const application = await JobApplication.create({
    companyId: job.companyId,
    userId: user.clerkId,
    jobId,
    date: Date.now(),
  });

  return res.status(201).json(new ApiResponse(201, { application }, "Applied successfully"));
});

// --- Get user job applications ---
const getUserJobApplications = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const user = await getOrCreateUser(userId);

  const applications = await JobApplication.find({ userId: user.clerkId })
    .populate("companyId", "name email image")
    .populate("jobId", "title description location category level salary")
    .exec();

  if (!applications.length) throw new ApiError(404, "No applications found");

  return res.status(200).json(new ApiResponse(200, { applications }, "Applications fetched successfully"));
});

// --- Update user resume ---
const updateUserResume = asyncHandler(async (req, res) => {
  const { userId } = req.auth();
  const user = await getOrCreateUser(userId);
  const resumeFile = req.file;

  if (resumeFile) {
    const uploadRes = await cloudinary.uploader.upload(resumeFile.path, { resource_type: "auto" });
    user.resume = uploadRes.secure_url;
  }

  await user.save();
  return res.status(200).json(new ApiResponse(200, { user }, "Resume updated successfully"));
});

export { getUserData, applyForJob, getUserJobApplications, updateUserResume };
