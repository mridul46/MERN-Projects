import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Menu, X } from "lucide-react"; // For hamburger icon

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const { setShowRecruiterLogin } = useContext(AppContext);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="shadow py-4 w-full bg-white sticky top-0 z-50">
      <div className="container px-4 sm:px-8 2xl:px-20 mx-auto flex justify-between items-center">
        {/* Logo */}
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          alt="logo"
          className="h-10 sm:h-12 cursor-pointer"
        />

        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              <Link to="/application" className="hover:text-blue-600">
                Applied Jobs
              </Link>
              <p className="text-gray-400">|</p>
              <p className="text-gray-700">Hi, {user.firstName + " " + user.lastName}</p>
              <UserButton />
            </>
          ) : (
            <>
              <button
                onClick={(e) => setShowRecruiterLogin(true)}
                className="text-gray-600 hover:text-blue-600"
              >
                Recruiter Login
              </button>
              <button
                onClick={(e) => openSignIn()}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
              >
                Login
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div className="sm:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-white shadow-md border-t border-gray-200">
          <div className="flex flex-col items-start px-6 py-4 space-y-4 text-sm font-medium">
            {user ? (
              <>
                <Link
                  to="/application"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-gray-800 hover:text-blue-600"
                >
                  Applied Jobs
                </Link>
                <p className="text-gray-700">Hi, {user.firstName + " " + user.lastName}</p>
                <UserButton />
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowRecruiterLogin(true);
                    setMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-blue-600 w-full text-left"
                >
                  Recruiter Login
                </button>
                <button
                  onClick={() => {
                    openSignIn();
                    setMenuOpen(false);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 w-full transition-all"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

