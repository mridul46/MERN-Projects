import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import Loading from '../components/Loading ';

const Viewapplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState(false);

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/v1/company/applicants`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      const applications = data?.data?.applications || [];
      if (data.success) {
        setApplicants(applications.reverse());
      } else {
        toast.info("No applicants found.");
        setApplicants([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      if (!applicationId || !status) return;

      const { data } = await axios.post(`${backendUrl}/api/v1/company/change-status`, { applicationId, status }, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (companyToken) fetchCompanyJobApplications();
  }, [companyToken]);

  if (applicants === false) return <Loading />;

  if (applicants.length === 0)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        No applicants found.
      </div>
    );

  return (
    <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 divide-y divide-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold">#</th>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold">User</th>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold hidden sm:table-cell">Job Title</th>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold hidden sm:table-cell">Location</th>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold">Resume</th>
              <th className="py-2 px-3 text-left text-gray-600 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {applicants.filter(item => item.jobId && item.userId).map((applicant, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="py-2 px-3 text-center">{index + 1}</td>

                {/* User Info */}
                <td className="py-2 px-3 flex items-center">
                  <img className="w-10 h-10 rounded-full mr-3 hidden sm:block" src={applicant.userId.image} alt={applicant.userId.name} />
                  <span className="text-gray-700 text-sm sm:text-base">{applicant.userId.name}</span>
                </td>

                {/* Job Info */}
                <td className="py-2 px-3 hidden sm:table-cell">{applicant.jobId.title}</td>
                <td className="py-2 px-3 hidden sm:table-cell">{applicant.jobId.location}</td>

                {/* Resume */}
                <td className="py-2 px-3 text-center">
                  {applicant.userId.resume ? (
                    <a
                      href={applicant.userId.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition"
                    >
                      <img src={assets.resume_download_icon} alt="Download" className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Resume</span>
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm sm:text-base">No Resume</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-2 px-3 relative">
                  {applicant.status === 'pending' ? (
                    <div className="relative inline-block group">
                      <button className="text-gray-500 px-2 py-1 rounded hover:bg-gray-100">...</button>
                      <div className="z-10 hidden absolute right-0 sm:left-0 top-0 mt-2 w-28 sm:w-32 bg-white border border-gray-200 rounded shadow group-hover:block">
                        <button
                          onClick={() => updateApplicationStatus(applicant._id, "Accepted")}
                          className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(applicant._id, "Rejected")}
                          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-base capitalize">{applicant.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Viewapplications;
