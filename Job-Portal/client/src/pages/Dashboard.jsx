import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyData, setCompanyData, companyToken, setCompanyToken } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // --- Redirect if not logged in ---
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <div className="shadow py-3 bg-white w-full sticky top-0 z-50">
        <div className="px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button for mobile */}
            <button
              className="sm:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <img
              onClick={() => navigate("/")}
              className="w-28 sm:w-40 cursor-pointer"
              src={assets.logo}
              alt="Logo"
            />
          </div>

          {/* Profile / Dropdown */}
          {companyData ? (
            <div className="flex items-center gap-3">
              <p className="hidden sm:block text-gray-700">
                Welcome, {companyData.name}
              </p>
              <div className="relative" ref={dropdownRef}>
                <img
                  className="w-9 h-9 border rounded-full cursor-pointer object-cover hover:opacity-80 transition"
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

      {/* Main Section */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
          className={`fixed sm:static top-0 left-0 h-full sm:h-auto bg-white border-r-2 shadow-md sm:shadow-sm transform transition-transform duration-300 ease-in-out z-40 sm:z-auto 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}
        >
          <ul className="flex flex-col items-start pt-16 sm:pt-5 text-gray-800 w-56 sm:w-60">
            {[
              { to: "add-job", label: "Add Job" },
              { to: "manage-jobs", label: "Manage Jobs" },
              { to: "view-applications", label: "View Applications" },
            ].map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 transition ${
                    isActive
                      ? "bg-blue-100 border-r-4 border-blue-500 text-blue-600"
                      : ""
                  }`
                }
                to={item.to}
                onClick={() => setIsSidebarOpen(false)} // auto close on mobile
              >
                <span className="text-sm sm:text-base whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            ))}
          </ul>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 sm:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto mt-14 sm:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
