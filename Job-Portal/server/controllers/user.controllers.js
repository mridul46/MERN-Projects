import { Job } from "../models/Job.models.js";
import { JobApplication } from "../models/jobApplication.model.js";
import { User } from "../models/User.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { v2 as cloudinary } from "cloudinary";
import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const getOrCreateUser = async (userId) => {
  const cUser = await clerk.users.getUser(userId);

  // Extract email
  const email =
    cUser.emailAddresses?.[0]?.emailAddress ||
    `no-email-${userId}@example.com`;

  // Combine Clerk's first and last name
  const name = [cUser.firstName, cUser.lastName].filter(Boolean).join(" ") || "Unknown User";

  // Use Clerk profile image or placeholder
  const image = cUser.imageUrl || "https://via.placeholder.com/150";

  // Check for existing user in MongoDB
  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    // 🆕 Create a new user
    user = await User.create({
      clerkId: cUser.id,
      email,
      name,
      image,
      resume: "", // default empty until uploaded
    });
    console.log("✅ Created new user:", user.email);
  } else {
    // 🔄 Update existing user if necessary
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

    // Preserve resume — don't overwrite if already present
    if (!user.resume) {
      user.resume = "";
      updated = true;
    }

    if (updated) {
      await user.save();
      console.log("🔁 Updated existing user:", user.email);
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

// --- Update User Resume ---
const updateUserResume = asyncHandler(async (req, res) => {
  const clerkId = req.auth?.userId;

  if (!clerkId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  // Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: `resumes/${clerkId}` },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(req.file.buffer);
  });

  // Update user in DB
  const user = await User.findOneAndUpdate(
    { clerkId },
    { resume: uploadResult.secure_url },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Resume updated successfully",
    data: user,
  });
});


export { getUserData, applyForJob, getUserJobApplications, updateUserResume };
