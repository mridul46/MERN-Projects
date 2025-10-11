import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading ";

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);
  const [applicants, setApplicants] = useState(null);

  // Fetch all applications
  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/v1/company/applicants`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      if (data?.success) {
        const applications = data?.data?.applications || [];
        setApplicants([...applications].reverse());
      } else {
        toast.info("No applicants found.");
        setApplicants([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setApplicants([]);
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId, status) => {
    if (!applicationId || !status) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/v1/company/change-status`,
        { applicationId, status },
        { headers: { Authorization: `Bearer ${companyToken}` } }
      );

      if (data?.success) {
        toast.success(data.message || "Status updated");
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (companyToken) fetchCompanyJobApplications();
  }, [companyToken]);

  if (applicants === null) return <Loading />;

  if (applicants.length === 0)
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-lg sm:text-2xl text-gray-600">No Applications Available</p>
      </div>
    );

  const getStatus = (applicant) =>
    applicant?.status || applicant?.applicationStatus || "pending";

  return (
    <div className="container mx-auto px-3 sm:px-6 md:px-8 py-4">
      {/* --- Desktop / Tablet View --- */}
      <div className="hidden sm:block overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm sm:text-base text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4 hidden sm:table-cell">Job Title</th>
              <th className="py-3 px-4 hidden md:table-cell">Location</th>
              <th className="py-3 px-4 text-center">Resume</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {applicants
              .filter((a) => a.jobId && a.userId)
              .map((applicant, index) => {
                const status = getStatus(applicant);
                return (
                  <tr key={applicant._id || index} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-center text-gray-600">{index + 1}</td>

                    <td className="py-3 px-4 flex items-center">
                      <img
                        src={applicant.userId.image || assets.defaultAvatar}
                        alt={applicant.userId.name}
                        className="w-9 h-9 rounded-full mr-3 object-cover"
                      />
                      <span className="text-gray-700">{applicant.userId.name}</span>
                    </td>

                    <td className="py-3 px-4 hidden sm:table-cell text-gray-700">
                      {applicant.jobId.title}
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-gray-700">
                      {applicant.jobId.location}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {applicant.userId.resume ? (
                        <a
                          href={applicant.userId.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition"
                        >
                          <img
                            src={assets.resume_download_icon}
                            alt="Download"
                            className="w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span>Resume</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">No Resume</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {status.toLowerCase() === "pending" ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() =>
                              updateApplicationStatus(applicant._id, "Accepted")
                            }
                            className="text-green-600 font-medium hover:underline"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              updateApplicationStatus(applicant._id, "Rejected")
                            }
                            className="text-red-500 font-medium hover:underline"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`capitalize font-medium ${
                            status === "Accepted"
                              ? "text-green-600"
                              : status === "Rejected"
                              ? "text-red-500"
                              : "text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* --- Mobile View --- */}
      <div className="sm:hidden mt-6 space-y-4">
        {applicants
          .filter((a) => a.jobId && a.userId)
          .map((applicant, index) => {
            const status = getStatus(applicant);
            return (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm bg-white space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={applicant.userId.image || assets.defaultAvatar}
                    alt={applicant.userId.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {applicant.userId.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {applicant.jobId.title}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  📍 {applicant.jobId.location}
                </p>

                <div className="flex justify-between items-center pt-2">
                  {applicant.userId.resume ? (
                    <a
                      href={applicant.userId.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View Resume
                    </a>
                  ) : (
                    <span className="text-gray-400 italic text-sm">
                      No Resume
                    </span>
                  )}

                  {status.toLowerCase() === "pending" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          updateApplicationStatus(applicant._id, "Accepted")
                        }
                        className="text-green-600 text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          updateApplicationStatus(applicant._id, "Rejected")
                        }
                        className="text-red-500 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`capitalize text-sm font-medium ${
                        status === "Accepted"
                          ? "text-green-600"
                          : status === "Rejected"
                          ? "text-red-500"
                          : "text-gray-600"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ViewApplications;
