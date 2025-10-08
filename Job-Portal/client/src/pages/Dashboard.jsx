import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    companyData,
    setCompanyData,
    companyToken,
    setCompanyToken,
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // --- Logout function ---
  const logout = () => {
    setCompanyToken(null);
    setCompanyData(null);
    localStorage.removeItem("companyToken");
    localStorage.removeItem("companyData");
    navigate("/", { replace: true });
  };

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Redirect if not logged in or to default nested route ---
  useEffect(() => {
    if (!companyToken) {
      setLoading(false);
      navigate("/", { replace: true });
    } else {
      setLoading(false);
      if (location.pathname === "/dashboard") {
        navigate("/dashboard/manage-jobs", { replace: true });
      }
    }
  }, [companyToken, navigate, location.pathname]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading Dashboard...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="shadow py-4 bg-white">
        <div className="px-5 flex justify-between items-center">
          <img
            onClick={() => navigate("/")}
            className="max-sm:w-32 cursor-pointer"
            src={assets.logo}
            alt="Logo"
          />
          {companyData ? (
            <div className="flex items-center gap-3">
              <p className="max-sm:hidden text-gray-700">
                Welcome, {companyData.name}
              </p>
              <div className="relative" ref={dropdownRef}>
                <img
                  className="w-10 h-10 border rounded-full cursor-pointer object-cover hover:opacity-80 transition"
                  src={companyData.image || assets.defaultAvatar}
                  alt="Company Avatar"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                />
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-50">
                    <ul className="list-none p-0 m-0">
                      <li
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                        onClick={logout}
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className="flex items-start">
        {/* Sidebar */}
        <div className="inline-block min-h-screen border-r-2 bg-white shadow-sm">
          <ul className="flex flex-col items-start pt-5 text-gray-800">
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 transition ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500 text-blue-600" : ""
                }`
              }
              to="add-job"
            >
              <span className="text-sm sm:text-base whitespace-nowrap">Add Job</span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 transition ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500 text-blue-600" : ""
                }`
              }
              to="manage-jobs"
            >
              <span className="text-sm sm:text-base whitespace-nowrap">Manage Jobs</span>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 transition ${
                  isActive ? "bg-blue-100 border-r-4 border-blue-500 text-blue-600" : ""
                }`
              }
              to="view-applications"
            >
              <span className="text-sm sm:text-base whitespace-nowrap">View Applications</span>
            </NavLink>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

