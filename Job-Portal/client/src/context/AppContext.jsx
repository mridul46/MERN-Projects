import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

// Create Context
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useUser();
  const { getToken } = useAuth();

  // --- States ---
  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [companyToken, setCompanyToken] = useState(localStorage.getItem("companyToken"));
  const [companyData, setCompanyData] = useState(
    JSON.parse(localStorage.getItem("companyData")) || null
  );

  // --- Store token and company data in localStorage ---
  const saveCompanyToken = (token) => {
    localStorage.setItem("companyToken", token);
    setCompanyToken(token);
  };

  const removeCompanyToken = () => {
    localStorage.removeItem("companyToken");
    setCompanyToken(null);
  };

  const saveCompanyData = (data) => {
    localStorage.setItem("companyData", JSON.stringify(data));
    setCompanyData(data);
  };

  const removeCompanyData = () => {
    localStorage.removeItem("companyData");
    setCompanyData(null);
  };

  // --- Fetch all jobs ---
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/jobs`);
      if (response.data.success) {
        setJobs(response.data.data.jobs);
      } else {
        toast.error(response.data.message || "Failed to get jobs");
      }
    } catch (error) {
      toast.error(error.message || "Failed to get jobs");
    }
  };

  // --- Fetch company data ---
  const fetchCompanyData = async () => {
    if (!companyToken) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/v1/company/company`, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      if (data.success) {
        const company = data.company || data.data?.company;
        saveCompanyData(company); // store in state + localStorage
      } else {
        toast.error(data.message || "Failed to fetch company data");
        removeCompanyToken();
        removeCompanyData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      removeCompanyToken();
      removeCompanyData();
    }
  };

  // --- Logout function ---
  const logout = () => {
    removeCompanyToken();
    removeCompanyData();
    window.location.href = "/"; // redirect to home
  };

  // --- Fetch company data when token changes ---
  useEffect(() => {
    fetchCompanyData();
  }, [companyToken]);

  // --- On first load, fetch jobs ---
  useEffect(() => {
    fetchJobs();
  }, []);

  // --- Context value ---
  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    showRecruiterLogin,
    setShowRecruiterLogin,
    companyToken,
    setCompanyToken: saveCompanyToken,
    companyData,
    setCompanyData: saveCompanyData,
    backendUrl,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

