import React, { useEffect, useState } from "react";
import logo from "../../assets/logo1.png";
import logo1 from "../../assets/logo.png";
// import logoSmall from "../../assets/logo-small.png"; // Add this small, faded logo
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { generate_keys } from "../../utils/generate_keys";
import { encrypt_key } from "../../utils/encrypt_key";
import { USER_API } from "@/constants/constant";
import { toast } from "sonner";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import useUserStore from "@/store/userStore";

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passphrase: "",
  });

  const [errors, setErrors] = useState("");


    useEffect(() => {
      if (user) {
        navigate("/");
      }
    }, [user, navigate]);
  const handleNavigate = () => {
    setAnimating(true);
    setTimeout(() => navigate("/login"), 300);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrors("All fields are required.");
      return;
    }
    setErrors("");
    setStep(2);
  };

//register.jsx
const handleSubmitStep2 = async (e) => {
  e.preventDefault();

  if (!formData.passphrase) {
    setErrors("Passphrase is required.");
    return;
  }
  setLoading(true); // Add loading state

  try {
    const { publicKey, rawPrivateKey } = await generate_keys();

    // ✅ Use ArrayBuffer (rawPrivateKey), not base64 string
    const encryptedPrivateKey = await encrypt_key(rawPrivateKey, formData.passphrase);

    localStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);

    await axios.post(`${USER_API}/register`, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      public_key: publicKey,
    }, { withCredentials: true });

    toast.success("Registered successfully! Redirecting to login...");
    navigate("/login");
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      (error.message.includes("encrypt_key") ? "Encryption failed: Invalid passphrase or key." :
      error.message.includes("generate_keys") ? "Key generation failed." :
      "Registration failed. Please try again.");
    toast.error(errorMessage);
    console.error("Registration error:", error);
  } finally {
    setLoading(false); // Reset loading state
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

      <section
       className="relative diagonal-pattern min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 overflow-hidden"
        
      >
        <div
          className={`bg-white/80 backdrop-blur-sm flex flex-col md:flex-row rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden transition duration-300 ${
            animating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {/* Visual side */}
          <div className="md:w-1/2 hidden md:flex flex-col items-center justify-center bg-[#002D74] text-white p-8">
            <img src={logo} alt="SignSure Logo" className="h-20 w-auto mb-4" />
            <p className="text-lg font-semibold text-center">
              “Encryption begins with you. SignSure keeps your keys safe.”
            </p>
          </div>

          {/* Form side */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h2 className="font-bold text-3xl text-[#002D74]">
              {step === 1 ? "Create Account" : "Secure with Passphrase"}
            </h2>
            <p className="text-sm mt-2 text-[#002D74]">
              {step === 1
                ? "Sign up to start securing your documents with SignSure."
                : "Your passphrase will encrypt your private key. Don’t lose it — we can’t recover it."}
            </p>

            {errors && <p className="text-red-500 text-xs mt-2">{errors}</p>}

            {step === 1 ? (
              <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmitStep1}>
                <input
                  className="p-3 rounded-xl border"
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  className="p-3 rounded-xl border"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div className="relative">
                  <input
                    className="p-3 rounded-xl border w-full pr-10"
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmitStep2}>
                <input
                  className="p-3 rounded-xl border"
                  type="password"
                  name="passphrase"
                  placeholder="Passphrase"
                  value={formData.passphrase}
                  onChange={handleChange}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </>
                  ) : (
                    "Finish Registration"
                  )}
                </button>
              </form>
            )}

            <div className="text-xs mt-6 border-b border-[#002D74] py-2 text-[#002D74]">
              <a href="#">Forgot your password?</a>
            </div>

            <div className="mt-4 text-sm flex justify-between items-center text-[#002D74]">
              <p>Already have an account?</p>
              <button
                onClick={handleNavigate}
                className="py-2 px-5 border rounded-xl hover:scale-105 duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Register;
