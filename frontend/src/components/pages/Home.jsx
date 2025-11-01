import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Button } from "../ui/button";
import useUserStore from "@/store/userStore";

const Home = () => {
  const user = useUserStore((state) => state.user);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-[#002D74]">
      <Navbar />

      <div className="pt-20 flex-1">
        {user ? (
          // ✅ Logged-in UI
          <section className="flex flex-col items-center justify-center text-center px-4 py-24">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome back, {user.name || "User"}!
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
              You’re all set to sign, verify, and manage your documents securely.
            </p>
            <Button
              className="bg-[#002D74] text-white hover:bg-[#001e52]"
              onClick={() => window.location.href = "/sign-page"}
            >
              Go to Dashboard
            </Button>
          </section>
        ) : (
          <>
            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center px-4 py-24">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#002D74]">
                Sign Documents. Securely.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
                SignSure lets you sign and verify documents with client-side encryption.
                Your private key stays private — backed up by an optional QR code.
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <Button
                  className="bg-[#002D74] text-white hover:bg-[#001e52]"
                  onClick={() => window.location.href = "/register"}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  className="border-[#002D74] text-[#002D74] hover:bg-[#002D74] hover:text-white"
                  onClick={() => window.location.href = "/login"}
                >
                  Login
                </Button>
              </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-16 px-6 md:px-12">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-semibold mb-12">
                  Your Trust, Our Technology
                </h2>
                <div className="grid gap-8 md:grid-cols-3 text-left">
                  <div className="p-6 border border-[#e2e8f0] rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold text-[#002D74]">Zero Knowledge</h3>
                    <p className="text-gray-600 mt-2">
                      Private keys never touch our servers. Documents are signed and encrypted locally.
                    </p>
                  </div>
                  <div className="p-6 border border-[#e2e8f0] rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold text-[#002D74]">QR Code Backup</h3>
                    <p className="text-gray-600 mt-2">
                      Download a QR code backup of your encrypted private key — restore it anytime securely.
                    </p>
                  </div>
                  <div className="p-6 border border-[#e2e8f0] rounded-lg shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold text-[#002D74]">Cryptographic Signing</h3>
                    <p className="text-gray-600 mt-2">
                      Built with ECDSA and AES — sign and verify documents with industry-standard crypto.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
