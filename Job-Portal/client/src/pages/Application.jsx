import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { AppContext } from "../context/AppContext";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import axios from "axios";

const Application = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const {
    backendUrl,
    userData,
    fetchUserData,
    userApplications,
    fetchUserApplications,
  } = useContext(AppContext);

  const updateResume = async () => {
    if (!resume) return toast.error("Please select a resume before saving.");

    try {
      const formData = new FormData();
      formData.append("resume", resume);
      const token = await getToken();

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
      toast.error(error.response?.data?.message || error.message);
    }

    setIsEdit(false);
    setResume(null);
  };

  useEffect(() => {
    if (user) fetchUserApplications();
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-3 sm:px-6 md:px-10 2xl:px-20 my-10 min-h-[70vh]">
        {/* ----------------- Resume Section ----------------- */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Resume</h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
          {isEdit || !userData?.resume ? (
            <>
              <label
                htmlFor="resumeUpload"
                className="flex items-center cursor-pointer"
              >
                <p className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2 text-sm sm:text-base">
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id="resumeUpload"
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setResume(e.target.files[0])}
                />
                <img
                  src={assets.profile_upload_icon}
                  alt=""
                  className="w-6 h-6 sm:w-7 sm:h-7"
                />
              </label>
              <button
                onClick={updateResume}
                className="bg-green-100 border border-green-400 rounded-lg px-4 py-2 text-sm sm:text-base hover:bg-green-200 transition"
              >
                Save
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {userData?.resume && (
                <a
                  href={userData.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-center text-sm sm:text-base hover:bg-blue-200 transition"
                >
                  View Resume
                </a>
              )}
              <button
                onClick={() => setIsEdit(true)}
                className="text-gray-600 border border-gray-300 rounded-lg px-4 py-2 text-sm sm:text-base hover:bg-gray-100 transition"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* ----------------- Jobs Applied Section ----------------- */}
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Jobs Applied</h2>

        {/* Desktop / Tablet View */}
        <div className="hidden sm:block overflow-x-auto bg-white border rounded-lg shadow">
          <table className="min-w-full text-sm sm:text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Company</th>
                <th className="py-3 px-4 text-left">Job Title</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {userApplications && userApplications.length > 0 ? (
                userApplications.map((job, index) => (
                  <tr key={job._id || index} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-t flex items-center gap-2">
                      <img
                        className="w-8 h-8 rounded"
                        src={job.companyId?.image || assets.profile_upload_icon}
                        alt=""
                      />
                      <span>{job.companyId?.name || "Unknown Company"}</span>
                    </td>
                    <td className="py-3 px-4 border-t">{job.jobId?.title || "No Title"}</td>
                    <td className="py-3 px-4 border-t">
                      {job.jobId?.location || "N/A"}
                    </td>
                    <td className="py-3 px-4 border-t">
                      {job.date ? moment(job.date).format("ll") : "N/A"}
                    </td>
                    <td className="py-3 px-4 border-t">
                      <span
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          job.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : job.status === "Rejected"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {job.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-gray-500 border-t"
                  >
                    No applications found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card layout */}
        <div className="sm:hidden space-y-4 mt-6">
          {userApplications && userApplications.length > 0 ? (
            userApplications.map((job, index) => (
              <div
                key={index}
                className="bg-white border rounded-lg shadow p-4 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    className="w-10 h-10 rounded object-cover"
                    src={job.companyId?.image || assets.profile_upload_icon}
                    alt=""
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-base">
                      {job.companyId?.name || "Unknown Company"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {job.jobId?.title || "No Title"}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">
                  📍 {job.jobId?.location || "N/A"}
                </p>
                <p className="text-gray-500 text-xs">
                  {job.date ? moment(job.date).format("ll") : "N/A"}
                </p>

                <div className="pt-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      job.status === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : job.status === "Rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {job.status || "Pending"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No applications found</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Application;
