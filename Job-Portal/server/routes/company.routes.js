
import { Router } from 'express'
import { changeApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/company.controllers.js';
import upload from '../utils/multer.js';
import { protectCompany } from '../middleware/auth.middleware.js';

const router=Router();

//Routes
router.post("/register", upload.single("image"), registerCompany);
router.route('/login').post(loginCompany);
router.route('/company').get(protectCompany,getCompanyData);
router.route('/post-job').post(protectCompany,postJob);
router.route('/applicants').get(protectCompany,getCompanyJobApplicants);
router.route('/list-jobs').get(protectCompany,getCompanyPostedJobs);
router.route('/change-status').post(protectCompany,changeApplicationsStatus);
router.route('/change-visiblity').post(protectCompany,changeVisiblity);

export default router;