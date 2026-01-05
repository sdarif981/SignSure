import React from "react";

import Footer from "./Footer";
import Navbar from "./Navbar";

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 text-[#002D74] min-h-[calc(100vh-160px)] py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About SignSure</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Secure document signing powered by client-side cryptography
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-[#002D74]">SignSure</strong> is a modern platform for secure document signing, built around the principle of <strong className="text-[#002D74]">client-side cryptography</strong>.
              Your private keys never leave your device, making it impossible for anyone else — including us — to access your sensitive information.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you're a developer, legal professional, or organization — SignSure provides cryptographically secure tools for signing and verifying documents
              while ensuring full data ownership and zero trust dependency.
            </p>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 text-[#002D74]">Key Features</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-[#002D74] font-bold">✓</span>
                  <span><strong>Zero Knowledge Architecture:</strong> Your private keys are encrypted and stored locally, never transmitted to our servers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#002D74] font-bold">✓</span>
                  <span><strong>QR Code Backup:</strong> Securely backup your encrypted private key as a QR code for easy recovery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#002D74] font-bold">✓</span>
                  <span><strong>Industry-Standard Cryptography:</strong> Built with ECDSA (P-384) and AES encryption for maximum security.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#002D74] font-bold">✓</span>
                  <span><strong>Document Verification:</strong> Verify the authenticity of signed documents using public key cryptography.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
