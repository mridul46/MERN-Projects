import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ApplyJob from './pages/ApplyJob';
import Application from './pages/Application';
import RecruiterLogin from './components/RecruiterLogin';
import { AppContext } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Addjob from './pages/Addjob';
import Managejobs from './pages/Managejobs';
import Viewapplications from './pages/Viewapplications';
import 'quill/dist/quill.snow.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext);

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/application' element={<Application />} />

        {/* Dashboard - Protected Routes */}
        <Route path='/dashboard' element={<Dashboard />}>
          {companyToken ? (
            <>
              <Route path='add-job' element={<Addjob />} />
              <Route path='manage-jobs' element={<Managejobs />} />
              <Route path='view-applications' element={<Viewapplications />} />
              {/* Default child route redirect */}
              <Route index element={<Navigate to='manage-jobs' replace />} />
            </>
          ) : (
            // Redirect if not authenticated
            <Route
              path='*'
              element={<Navigate to='/dashboard/manage-jobs' replace />}
            />
          )}
        </Route>

        {/* Catch-all fallback */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  );
};

export default App;
