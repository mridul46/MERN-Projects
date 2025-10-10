import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import moment from "moment";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

const Application = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const { backendUrl, userData, fetchUserData,userApplications,fetchUserApplications } = useContext(AppContext);

  const updateResume = async () => {
    if (!resume) return toast.error("Please select a resume before saving.");

    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const token = await getToken();
      // console.log("🔑 Token:", token);

      const { data } = await axios.post(
        `${backendUrl}/api/v1/users/update-resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        await fetchUserData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // console.error("🔴 Update Resume Error:", error);
      toast.error(error.response?.data?.message || error.message);
    }

    setIsEdit(false);
    setResume(null);
  };
 useEffect(()=>{
   if(user){
    fetchUserApplications()
   }
 },[user])
  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65] 2xl:px-20 mx-auto my-10">
        <h2 className="text-xl font-semibold">Your Resume</h2>

        <div className="flex gap-2 mb-6 mt-3">
          {isEdit || !userData?.resume ? (
            <>
              <label className="flex items-center" htmlFor="resumeUpload">
                <p className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setResume(e.target.files[0])}
                />
                <img src={assets.profile_upload_icon} alt="" />
              </label>
              <button
                onClick={updateResume}
                className="bg-green-100 border border-green-400 rounded-lg px-4 py-2"
              >
                Save
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {userData?.resume && (
                <a
                  href={userData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg"
                >
                  View Resume
                </a>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-500 border-gray-300 rounded-lg px-4 py-2"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">Jobs Applied</h2>
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-left">Company</th>
              <th className="py-3 px-4 border-b text-left">Job Title</th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">Location</th>
              <th className="py-3 px-4 border-b text-left max-sm:hidden">Date</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
          {userApplications && userApplications.length > 0 ? (
            userApplications.map((job, index) => (
              <tr key={job._id || index}>
                <td className='py-3 px-4 flex items-center gap-2 border-b'>
                  <img className='w-8 h-8' src={job.companyId?.image || assets.profile_upload_icon} alt="" />
                  {job.companyId?.name || "Unknown Company"}
                </td>
                <td className='py-2 px-4 border-b'>{job.jobId?.title || "No Title"}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId?.location || "N/A"}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>
                  {job.date ? moment(job.date).format("ll") : "N/A"}
                </td>
                <td className='py-2 px-4 border-b'>
                  <span className={`${
                    job.status === "Accepted"
                      ? "bg-green-200"
                      : job.status === "Rejected"
                      ? "bg-red-200"
                      : "bg-blue-200"
                  } px-4 py-1.5 rounded`}>
                    {job.status || "Pending"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4">No applications found</td>
            </tr>
          )}
                 </tbody>

        </table>
      </div>
      <Footer />
    </>
  );
};

export default Application;
