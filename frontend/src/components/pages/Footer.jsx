import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#f3f5f9] w-full text-center py-6 text-sm text-[#002D74] mt-auto border-t border-[#dbe2ee]">
      <p>
        © {new Date().getFullYear()} <span className="font-semibold">SignSure</span>. Secure Document Signing with Client-side Cryptography.
      </p>
      <p className="text-xs mt-1 text-[#001e52] opacity-80">
        Private keys never leave your device. Backup with QR code.
      </p>
    </footer>
  );
};

export default Footer;
