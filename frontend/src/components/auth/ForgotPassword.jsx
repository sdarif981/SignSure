import React, { useState } from "react";
import logo from "../../assets/logo1.png";
import logo1 from "../../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API } from "@/constants/constant";
import { toast } from "sonner";
import Footer from "../pages/Footer";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${USER_API}/forgot-password`, { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${USER_API}/verify-otp`, { email, otp });
      toast.success("OTP verified!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${USER_API}/reset-password`, { email, otp, newPassword });
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

      <section className="relative diagonal-pattern min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 overflow-hidden">
        <div className="bg-white flex flex-col md:flex-row rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden transition duration-300">
          
          {/* Form Side */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="font-bold text-3xl text-[#002D74]">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Reset Password"}
            </h2>
            <p className="text-sm mt-2 text-[#002D74]">
              {step === 1 && "Enter your email to receive a One-Time Password."}
              {step === 2 && "Enter the OTP sent to your email."}
              {step === 3 && "Enter your new password."}
            </p>

            <form className="flex flex-col gap-4 mt-8" onSubmit={
              step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword
            }>
              
              {step === 1 && (
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded-xl border"
                  disabled={loading}
                />
              )}

              {step === 2 && (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="p-3 rounded-xl border"
                  disabled={loading}
                />
              )}

              {step === 3 && (
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="p-3 rounded-xl border w-full pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`bg-[#002D74] rounded-xl text-white py-2 flex items-center justify-center gap-2
                  ${loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"}
                  duration-300`}
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 1 && "Send OTP"}
                    {step === 2 && "Verify OTP"}
                    {step === 3 && "Reset Password"}
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-sm flex justify-between items-center text-[#002D74]">
              <p>Remember your password?</p>
              <button
                onClick={() => navigate("/login")}
                className="py-2 px-5 border rounded-xl hover:scale-105 duration-300"
              >
                Login
              </button>
            </div>
          </div>

          {/* Visual Side */}
          <div className="md:w-1/2 hidden md:flex flex-col items-center justify-center bg-[#002D74] text-white p-8">
            <img src={logo} alt="SignSure Logo" className="h-20 w-auto mb-4" />
            <p className="text-lg font-semibold text-center">
              “Your privacy, your keys. SignSure ensures your documents stay yours.”
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ForgotPassword;
