import React, { useEffect, useState } from "react";
import logo from "../../assets/logo1.png";
import logo1 from "../../assets/logo.png";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa"; // Added FaArrowLeft
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { generate_keys } from "../../utils/generate_keys";
import { encrypt_key } from "../../utils/encrypt_key";
import { USER_API } from "@/constants/constant";
import { toast } from "sonner";
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

  // Intercept Browser Back Button
  useEffect(() => {
    if (step === 2) {
      window.history.pushState(null, "", window.location.href);
      const handleBackButton = (event) => {
        event.preventDefault();
        setStep(1);
      };
      window.addEventListener("popstate", handleBackButton);
      return () => window.removeEventListener("popstate", handleBackButton);
    }
  }, [step]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    if (errors) {
      if (step === 1) {
        const isValid = updatedData.name.trim() && updatedData.email.includes("@") && updatedData.password.length >= 6;
        if (isValid) setErrors("");
      } else if (step === 2 && name === "passphrase" && value.length >= 8) {
        setErrors("");
      }
    }
  };

  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrors("All fields are required.");
      return;
    }
    if (formData.password.length < 6) {
      setErrors("Password must be at least 6 characters long.");
      return;
    }
    setStep(2);
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    if (!formData.passphrase || formData.passphrase.length < 8) {
      setErrors("Passphrase must be at least 8 characters long.");
      return;
    }
    setLoading(true);

    try {
      const { publicKey, rawPrivateKey } = await generate_keys();
      const encryptedPrivateKey = await encrypt_key(rawPrivateKey, formData.passphrase);
      localStorage.setItem("encryptedPrivateKey", encryptedPrivateKey);

      await axios.post(`${USER_API}/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        public_key: publicKey,
      }, { withCredentials: true });

      toast.success("Registered successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Registration failed.");
      console.error(error);
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
            top: -50%; left: -50%; width: 200%; height: 200%;
            background-image: url(${logo1});
            background-size: 60px 60px;
            opacity: 0.04;
            transform: rotate(-15deg);
            z-index: 0;
            pointer-events: none;
          }
        `}
      </style>

      <section className="relative diagonal-pattern min-h-screen flex flex-col justify-center items-center px-4 bg-gray-50 overflow-hidden">
        <div className={`bg-white/80 backdrop-blur-sm flex flex-col md:flex-row rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden transition duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
          
          {/* Visual side */}
          <div className="md:w-1/2 hidden md:flex flex-col items-center justify-center bg-[#002D74] text-white p-8">
            <img src={logo} alt="Logo" className="h-20 w-auto mb-4" />
            <p className="text-lg font-semibold text-center">“Encryption begins with you.”</p>
          </div>

          {/* Form side */}
          <div className="md:w-1/2 p-8 md:p-12 relative">
            
            {/* Top Back Arrow (Step 2 Only) */}
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="absolute top-8 left-8 md:top-10 md:left-12 text-[#002D74] hover:text-blue-800 transition-colors flex items-center gap-2 group"
              >
                <FaArrowLeft />
                <span className="text-md font-medium">Back</span>
              </button>
            )}

            <div className={step === 2 ? "mt-8" : ""}>
              <h2 className="font-bold text-3xl text-[#002D74]">
                {step === 1 ? "Create Account" : "Secure with Passphrase"}
              </h2>
              <p className="text-sm mt-2 text-[#002D74]">
                {step === 1 ? "Sign up to start securing your documents." : "This passphrase encrypts your keys. Don't lose it."}
              </p>
            </div>

            {errors && <p className="text-red-500 text-xs mt-2">{errors}</p>}

            {step === 1 ? (
              <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmitStep1}>
                <input className="p-3 rounded-xl border" type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
                <input className="p-3 rounded-xl border" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                <div className="relative">
                  <input className="p-3 rounded-xl border w-full pr-10" type={showPass ? "text" : "password"} name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"><FaEye /></button>
                </div>
                <button type="submit" className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300">Continue</button>
              </form>
            ) : (
              <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmitStep2}>
                <input className="p-3 rounded-xl border" type="password" name="passphrase" placeholder="Passphrase" value={formData.passphrase} onChange={handleChange} />
                <button type="submit" disabled={loading} className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300 flex items-center justify-center gap-2">
                  {loading ? "Registering..." : "Finish Registration"}
                </button>
              </form>
            )}

            <div className="text-xs mt-6 border-b border-[#002D74] py-2 text-[#002D74]">
              <a href="#">Forgot your password?</a>
            </div>

            <div className="mt-4 text-sm flex justify-between items-center text-[#002D74]">
              <p>Already have an account?</p>
              <button onClick={handleNavigate} className="py-2 px-5 border rounded-xl hover:scale-105 duration-300">Login</button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Register;