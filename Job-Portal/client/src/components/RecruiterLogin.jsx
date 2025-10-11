import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const RecruiterLogin = () => {
  const navigate = useNavigate();
  const [state, setState] = useState('Login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false);

  const { setShowRecruiterLogin, backendUrl, setCompanyToken, setCompanyData } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Handle multi-step signup (first text fields, then image)
    if (state === "Sign Up" && !isTextDataSubmitted) {
      setIsTextDataSubmitted(true);
      return;
    }

    try {
      if (state === "Login") {
        const response = await axios.post(`${backendUrl}/api/v1/company/login`, { email, password });
        const company = response.data?.data?.company;

        if (!company?.token) {
          toast.error("Token missing in response");
          return;
        }

        setCompanyData(company);
        setCompanyToken(company.token);
        localStorage.setItem("companyToken", company.token);

        setShowRecruiterLogin(false);
        navigate("/dashboard");
        toast.success("Login successful");

      } else {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);
        if (image) formData.append("image", image);

        const response = await axios.post(`${backendUrl}/api/v1/company/register`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const company = response.data?.data?.company;

        if (!company?.token) {
          toast.error("Token missing in response");
          return;
        }

        setCompanyData(company);
        setCompanyToken(company.token);
        localStorage.setItem("companyToken", company.token);

        setShowRecruiterLogin(false);
        navigate("/dashboard");
        toast.success("Account created successfully");
      }

    } catch (error) {
      console.error("Error during submit:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-block/30 flex justify-center items-center">
      <form
        onSubmit={onSubmitHandler}
        className="relative bg-white p-10 rounded-xl text-slate-500"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          Recruiter {state}
        </h1>
        <p className="text-sm">Welcome back! Please sign in to continue</p>

        {state === 'Sign Up' && isTextDataSubmitted ? (
          <div className="flex items-center gap-4 my-10">
            <label htmlFor="image">
              <img
                className="w-16 h-16 object-cover rounded-full border"
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt="Upload"
              />
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                hidden
              />
            </label>
            <p>Upload Company <br /> logo</p>
          </div>
        ) : (
          <>
            {state !== 'Login' && (
              <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
                <img src={assets.person_icon} alt="icon" />
                <input
                  className="outline-none text-sm flex-1"
                  type="text"
                  placeholder="Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.email_icon} alt="icon" />
              <input
                className="outline-none text-sm flex-1"
                type="email"
                placeholder="Email Id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mt-5">
              <img src={assets.person_icon} alt="icon" />
              <input
                className="outline-none text-sm flex-1"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {state === 'Login' && (
          <p className="text-sm text-blue-600 mt-4 cursor-pointer">Forgot password</p>
        )}

        <button
          type="submit"
          className="bg-blue-600 w-full text-white py-4 rounded-full mt-4"
        >
          {state === 'Login' ? 'Login' : isTextDataSubmitted ? 'Create Account' : 'Next'}
        </button>

        {state === 'Login' ? (
          <p className="mt-5 text-center">
            Don't have an account?{' '}
            <span className="text-blue-600 cursor-pointer" onClick={() => setState('Sign Up')}>
              Sign Up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{' '}
            <span className="text-blue-600 cursor-pointer" onClick={() => setState('Login')}>
              Login
            </span>
          </p>
        )}

        <img
          onClick={() => setShowRecruiterLogin(false)}
          className="absolute top-5 right-5 cursor-pointer w-6 h-6"
          src={assets.cross_icon}
          alt="Close"
        />
      </form>
    </div>
  );
};

export default RecruiterLogin;
