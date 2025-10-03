import { Router } from "express";
import { getJobById, getJobs } from "../controllers/job.controllers.js";

const router= Router()

//route to get all jobs data
router.route('/').get(getJobs)
//route to get a single jobs by Id
router.route('/:id').get(getJobById)

export default router;