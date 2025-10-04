import jwt from "jsonwebtoken";
import { Company } from "../models/Company.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

export const protectCompany = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request: Token missing");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const company = await Company.findById(decodedToken._id|| decodedToken.id).select("-password");
    if (!company) {
      throw new ApiError(401, "Invalid access token");
    }

    req.company = company; // attach company to request
    next(); // must call next() in middleware
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
