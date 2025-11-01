import React, { useEffect, useState } from "react";
import logo from "../../assets/logo1.png";
import logo1 from "../../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API } from "@/constants/constant";
import { toast } from "sonner";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import useUserStore from "@/store/userStore";


const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleNavigate = () => {
    setAnimating(true);
    setTimeout(() => navigate("/register"), 300);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      const res = await axios.post(`${USER_API}/login`, formData,{withCredentials:true});
      toast.success("Login successful!");
      setUser(res.data.user);
      console.log("Login response:", res.data.user);
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      console.error("Login error:", error);
    }
  };

  return (
    <>
      {/* Optional Navbar */}
      {/* <Navbar /> */}
        <style>
           {`
             .diagonal-pattern::before {
               content: "";
               position: absolute;
               top: -50%;
               left: -50%;
               width: 200%;
               height: 200%;
               background-image: url(${logo1});
               background-size: 60px 60px;
               background-repeat: repeat;
               background-position: center;
               opacity: 0.04;
               transform: rotate(-15deg);
               z-index: 0;
               pointer-events: none;
             }
           `}
         </style>
      <section  className="relative diagonal-pattern min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 overflow-hidden">
        <div
          className={`bg-white flex flex-col md:flex-row rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden transition duration-300 ${
            animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {/* Form Side */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="font-bold text-3xl text-[#002D74]">Welcome Back</h2>
            <p className="text-sm mt-2 text-[#002D74]">
              Securely access your SignSure account.
            </p>

            <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 rounded-xl border"
              />
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="p-3 rounded-xl border w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300"
              >
                Login
              </button>
            </form>

            <div className="text-xs mt-4 text-[#002D74] border-b py-2">
              <a href="#">Forgot your password?</a>
            </div>

            <div className="mt-4 text-sm flex justify-between items-center text-[#002D74]">
              <p>Don't have an account?</p>
              <button
                onClick={handleNavigate}
                className="py-2 px-5 border rounded-xl hover:scale-105 duration-300"
              >
                Register
              </button>
            </div>
          </div>

          {/* Visual Side */}
          <div className="md:w-1/2 hidden md:flex flex-col items-center justify-center bg-[#002D74] text-white p-8">
            <img
              src={logo}
              alt="SignSure Logo"
              className="h-20 w-auto mb-4"
            />
            <p className="text-lg font-semibold text-center">
              “Your privacy, your keys. SignSure ensures your documents stay yours.”
            </p>
          </div>
        </div>
      </section>

      {/* Optional Footer */}
      <Footer />
    </>
  );
};

export default Login;
