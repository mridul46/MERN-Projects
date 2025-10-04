import { Router } from "express";
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from "../controllers/user.controllers.js";
import upload from "../utils/multer.js";

const router= Router()

//get user data
router.route('/user').get(getUserData)
//Apply for a job
router.route('/apply').post(applyForJob)
// get applied jobs data
router.route('/applications').get(getUserJobApplications)
//update user profilr(resume)
router.route('/update-resume').post(upload.single('resume'),updateUserResume)


export default router