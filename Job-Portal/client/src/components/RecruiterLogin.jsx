import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import  {useNavigate} from 'react-router-dom'
import { toast } from 'react-toastify'

const RecruiterLogin = () => {

  const navigate= useNavigate()
    const [state,setState] =useState('Login')
    const [name,setName] = useState('')
    const [email,setEmail] =useState('')
    const [password,setPassword] = useState('')
    const [image,setImage] = useState(false)
    const [isTextDataSubmitted,setIsTextDataSubmitted] =useState(false)
    const {setShowRecruiterLogin,backendUrl,setCompanyToken,setCompanyData} = useContext( AppContext )

  const onSubmitHandler = async (e) => {
  e.preventDefault();

  if (state === "Sign Up" && !isTextDataSubmitted) {
    setIsTextDataSubmitted(true);
    return;
  }

  try {
    if (state === "Login") {
      // ----------- LOGIN -----------
      const { data } = await axios.post(`${backendUrl}/api/v1/company/login`, {
        email,
        password,
      });

      if (data.success) {
        console.log("Login Response:", data);

        const company = data.data?.company || data.company; // ✅ handle both structures
        const token = company?.token;

        if (!token) {
          toast.error("Token missing in response");
          return;
        }

        setCompanyData(company);
        setCompanyToken(token);
        localStorage.setItem("companyToken", token);

        setShowRecruiterLogin(false);
        navigate("/dashboard");
        toast.success("Login successful");
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } else {
      // ----------- REGISTER -----------
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/api/v1/company/register`,
        formData
      );

      if (data.success) {
        console.log("Register Response:", data);

        const company = data.data?.company || data.company; // ✅ handle both structures
        const token = company?.token;

        if (!token) {
          toast.error("Token missing in response");
          return;
        }

        setCompanyData(company);
        setCompanyToken(token);
        localStorage.setItem("companyToken", token);

        setShowRecruiterLogin(false);
        navigate("/dashboard");
        toast.success("Account created successfully");
      } else {
        toast.error(data.message || "Registration failed");
      }
    }
  } catch (error) {
    console.error("Error during submit:", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};



    useEffect(()=>{
       document.body.style.overflow= 'hidden'

       return () =>{
        document.body.style.overflow= 'unset'
       }
    },[])
  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-block/30 flex justify-center items-center'>
       <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 '>
        <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state} </h1>
        <p className='text-sm'>Welcome back! Please sign in to continue</p>
         {state=== 'Sign Up' && isTextDataSubmitted
          ?  <>
                <div className='flex items-center gap-4 my-10 '>
                  <label htmlFor="image">
                    <img className='w-16 rounded-full' src={image? URL.createObjectURL(image): assets.upload_area}   alt="" />
                    <input on onChange={e=>setImage(e.target.files[0])} type="file" 
                      id='image'
                      hidden
                    />
                  </label>
                  <p>Upload Company <br /> logo</p>
                </div>
             </>
          :  <>
           {state !== 'Login' &&(
             <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.person_icon} alt="" />
              <input className='outline-none text-sm' onChange={e=>setName(e.target.value)} value={name} type="text" placeholder='Company Name' required />
            </div>
           )}
             <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.email_icon} alt="" />
              <input className='outline-none text-sm'   onChange={e=>setEmail(e.target.value)} value={email} type="email" placeholder='email Id' required />
            </div>

             <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.person_icon} alt="" />
              <input className='outline-none text-sm' onChange={e=>setPassword(e.target.value)} value={password} type="password" placeholder='password' required />
            </div>
           
        </>
         }
         {state==='Login' && <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot password</p> } 
       
        <button type='submit' className='bg-blue-600 w-full text-white py-4 rounded-full mt-4 '>
            {state=== 'Login' ? 'login' : isTextDataSubmitted ? 'create account': 'next'}
        </button>
        {
            state=== 'Login'
            ?  <p className='mt-5 text-center'>Don't have an account ? <span  className='text-blue-600 cursor-pointer' onClick={()=> setState("Sign Up")}>Sign Up</span></p>
            :  <p className='mt-5 text-center'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState("Login")}>Login</span> </p>
        }
        
        <img onClick={e=>setShowRecruiterLogin(false)} className='absolute top-5 right-5 cursor-pointer' src={assets.cross_icon} alt="" />
       </form>
    </div>
  )
}

export default RecruiterLogin