import { Router } from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  updateUserResume,
} from "../controllers/user.controllers.js";
import upload from "../utils/multer.js";
import { requireAuth } from "@clerk/express";

const router = Router();

router.get("/user", requireAuth(), getUserData);
router.post("/apply", requireAuth(), applyForJob);
router.get("/applications", requireAuth(), getUserJobApplications);
router.post("/update-resume", requireAuth(), upload.single("resume"), updateUserResume);

export default router;
