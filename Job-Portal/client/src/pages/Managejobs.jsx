import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from '../components/Loading ';
const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(false);
  const { backendUrl, companyToken } = useContext(AppContext);
  
  // ✅ Fetch company jobs
  const fetchCompanyJobs = async () => {
    try {
      const token = companyToken || localStorage.getItem("companyToken");

      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        localStorage.removeItem("companyToken");
        navigate("/");
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/v1/company/list-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        console.log("📦 API Response:", data);
        const jobList = data?.data?.jobsData || []; // ✅ fixed structure
        setJobs([...jobList].reverse());
      } else {
        toast.error(data.message || "Failed to display jobs.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Something went wrong";
      toast.error(message);
    }
  };

  // ✅ Change job visibility
  const changeJobVisibility = async (id) => {
    try {
      const token = companyToken || localStorage.getItem("companyToken");

      if (!token) {
        toast.error("Authentication token missing. Please log in again.");
        navigate("/");
        return;
      }

    const { data } = await axios.post(
    `${backendUrl}/api/v1/company/change-visiblity`, // fix typo
    { id },
    {
     headers: { Authorization: `Bearer ${token}` },
    }
    );

      if (data.success) {
        toast.success(data.message || "Visibility status changed");
        fetchCompanyJobs(); // refresh list
      } else {
        toast.error(data.message || "Failed to change visibility.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Something went wrong";
      toast.error(message);
    }
  };

  useEffect(() => {
    fetchCompanyJobs();
  }, [companyToken]);

  return jobs? jobs.length === 0 ? (<div  className="flex items-center justify-center h-[70vh]">
    <p className="text-xl sm:text-2xl">No jobs Available or posted </p>
  </div>) : (
    <div className="container p-4 max-w-5xl">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 max-sm:text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">#</th>
              <th className="py-2 px-4 border-b text-left">Job Title</th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">Date</th>
              <th className="py-2 px-4 border-b text-left max-sm:hidden">Location</th>
              <th className="py-2 px-4 border-b text-center">Applicants</th>
              <th className="py-2 px-4 border-b text-left">Visible</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <tr key={index} className="text-gray-700">
                  <td className="py-2 px-4 border-b max-sm:hidden">{index + 1}</td>
                  <td className="py-2 px-4 border-b">{job.title}</td>
                  <td className="py-2 px-4 border-b max-sm:hidden">
                    {moment(job.date).format("ll")}
                  </td>
                  <td className="py-2 px-4 border-b max-sm:hidden">{job.location}</td>
                  <td className="py-2 px-4 border-b text-center">{job.applicants}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <input
                      type="checkbox"
                      className="scale-125 ml-4 cursor-pointer"
                      checked={job.visible}
                      onChange={() => changeJobVisibility(job._id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-gray-500 py-4 border-b"
                >
                  No jobs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="p-3 mt-4 bg-black text-white rounded"
        >
          Add new job
        </button>
      </div>
    </div>
  ): <Loading/>
};

export default ManageJobs;
