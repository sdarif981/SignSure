import React, { useState } from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import useUserStore from "@/store/userStore";
import QRCode from "qrcode";
import axios from "axios";
import { toast } from "sonner";
import { KEY_API, USER_API } from "@/constants/constant";
const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleDownloadQR = async () => {
    const encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
    if (!encryptedPrivateKey) {
      toast.error("No encrypted private key found in local storage.");
      return;
    }

    try {
      const qrDataUrl = await QRCode.toDataURL(encryptedPrivateKey, {
        errorCorrectionLevel: "H",
        width: 300,
      });
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = "encrypted-private-key-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded successfully.");
    } catch (err) {
      toast.error("Failed to generate QR code.");
      console.error("QR code generation error:", err);
    }
  };

  const handleDownloadPublicKey = async () => {
    try {
      const res = await axios.get(`${KEY_API}/public_key`, {
        withCredentials: true,
      });
      const publicKey = res.data.public_key;

      if (!publicKey) {
        toast.error("No public key found.");
        return;
      }

      // Create a Blob from the public key string
      const blob = new Blob([publicKey], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      // Create a hidden download link
      const link = document.createElement("a");
      link.href = url;
      link.download = "SignSure-public-key.txt"; // filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to fetch public key. Please try again.";
      toast.error(errorMessage);
      console.error("Download error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear cookie
      await axios.get(`${USER_API}/logout`, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with logout even if backend call fails
    } finally {
      // Clear user state only - keep encryptedPrivateKey in localStorage
      // Private key persists unless manually removed from dev tools
      setUser(null);
      navigate("/login");
    }
  };

  const linkClass = `relative pb-1 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 
  after:bg-[#002D74] after:transition-all after:duration-300 hover:after:w-full text-[#002D74] hover:text-[#001e52] transition-colors duration-200`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="SignSure Logo" className="h-8" />
          <span className="font-semibold text-lg">SignSure</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link to="/" className={linkClass}>
            Home
          </Link>
          <Link to="/about" className={linkClass}>
            About
          </Link>
          <Link to="/contact" className={linkClass}>
            Contact
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className={linkClass}>
                Logout
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Services ▾</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={handleDownloadQR}
                    className="text-[#002D74] hover:bg-[#e5ecf7]"
                  >
                    Download QR Backup
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleDownloadPublicKey}
                    className="text-[#002D74] hover:bg-[#e5ecf7]"
                  >
                    Download Public Key
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="text-[#002D74] hover:bg-[#e5ecf7]"
                  >
                    <Link to="/sign-page">Sign Document</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="text-[#002D74] hover:bg-[#e5ecf7]"
                  >
                    <Link to="/verify-page">Verify Document</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                Login
              </Link>
              <Link to="/register" className={linkClass}>
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-black"
          onClick={() => setShowMenu(!showMenu)}
        >
          <RxHamburgerMenu />
        </button>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-6">
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">Navigation</p>
            <Link
              to="/"
              onClick={() => setShowMenu(false)}
              className="block text-[#002D74] hover:text-[#001e52]
"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setShowMenu(false)}
              className="block text-[#002D74] hover:text-[#001e52]
"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setShowMenu(false)}
              className="block text-[#002D74] hover:text-[#001e52]
"
            >
              Contact
            </Link>
          </div>

          {user ? (
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Services</p>
              <button
                onClick={handleDownloadQR}
                className="block text-left w-full text-[#002D74] hover:text-[#001e52]
"
              >
                Download QR Backup
              </button>
              <button
                onClick={handleDownloadPublicKey}
                className="block text-left w-full text-[#002D74] hover:text-[#001e52]
"
              >
                Download Public Key
              </button>
              <Link
                to="/sign-page"
                onClick={() => setShowMenu(false)}
                className="block text-[#002D74] hover:text-[#001e52]
"
              >
                Sign Document
              </Link>
              <Link
                to="/verify-page"
                onClick={() => setShowMenu(false)}
                className="block text-[#002D74] hover:text-[#001e52]
"
              >
                Verify Document
              </Link>              

              <Link
                to="/"
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="block text-[#002D74] hover:text-[#001e52]"
              >
                Logout
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Account</p>
              <Link
                to="/login"
                onClick={() => setShowMenu(false)}
                className="block text-[#002D74] hover:text-[#001e52]
"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setShowMenu(false)}
                className="block text-[#002D74] hover:text-[#001e52]
"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
