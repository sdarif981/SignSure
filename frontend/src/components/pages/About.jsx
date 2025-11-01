import React from "react";

import Footer from "./Footer";
import Navbar from "./Navbar";

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <main className="bg-white text-[#002D74] min-h-[calc(100vh-160px)] py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">About SignSure</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            <strong>SignSure</strong> is a modern platform for secure document signing, built around the principle of <strong>client-side cryptography</strong>.
            Your private keys never leave your device, making it impossible for anyone else — including us — to access your sensitive information.
          </p>
          <p className="text-gray-600">
            Whether you're a developer, legal professional, or organization — SignSure provides cryptographically secure tools for signing and verifying documents
            while ensuring full data ownership and zero trust dependency.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
