import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaFileUpload, FaRegFileAlt, FaKey, FaSignature } from "react-icons/fa";
import { MdOutlineVerified, MdCheckCircle } from "react-icons/md";
import { Loader2, ShieldCheck } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

const VerifyDocument = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [publicKeyFile, setPublicKeyFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- LOGIC PRESERVED ---
  const hexToArrayBuffer = (hex) => {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return bytes.buffer;
  };

  const base64ToArrayBuffer = (b64) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const handleOriginalFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setOriginalFile(f);
  };

  const handleSignatureFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setSignatureFile(f);
  };

  const handlePublicKeyFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setPublicKeyFile(f);
  };

  const handleVerify = async () => {
    if (!originalFile || !signatureFile || !publicKeyFile) {
      toast.error("Please upload all required files.");
      return;
    }

    setLoading(true);
    try {
      const signatureText = await signatureFile.text();
      const lines = signatureText.split('\n');
      const signatureHex = lines.find(line => line.match(/^[0-9a-fA-F]+$/))?.trim();
      
      if (!signatureHex) throw new Error("Invalid signature file format.");

      const publicKeyText = await publicKeyFile.text();
      const publicKeyBuffer = base64ToArrayBuffer(publicKeyText.trim());

      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        { name: "ECDSA", namedCurve: "P-384" },
        false,
        ["verify"]
      );

      const fileBytes = await originalFile.arrayBuffer();
      const signatureBuffer = hexToArrayBuffer(signatureHex);

      const isValid = await window.crypto.subtle.verify(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        publicKey,
        signatureBuffer,
        fileBytes
      );

      if (isValid) {
        toast.success("Signature verification successful!");
      } else {
        toast.error("Signature verification failed.");
      }
    } catch (err) {
      toast.error(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- MODERN UI COMPONENTS ---
  const FileUploadSlot = ({ label, file, onChange, icon: Icon, accept }) => (
    <div className="group relative flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-[#002D74]/60 ml-1">
        {label}
      </label>
      <label className={`
        relative flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer
        ${file 
          ? "border-green-500/50 bg-green-50/30" 
          : "border-slate-200 bg-slate-50/50 hover:border-[#002D74]/30 hover:bg-white"}
      `}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${file ? "bg-green-100 text-green-600" : "bg-[#002D74]/10 text-[#002D74]"}`}>
            {file ? <MdCheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-semibold ${file ? "text-slate-900" : "text-slate-500"}`}>
              {file ? file.name : `Select ${label}`}
            </span>
            <span className="text-[11px] text-slate-400">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : `Click to browse files`}
            </span>
          </div>
        </div>
        <input type="file" onChange={onChange} accept={accept} className="hidden" />
        {!file && <FaFileUpload className="w-4 h-4 text-slate-300 group-hover:text-[#002D74] transition-colors" />}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[#002D74]/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-[#002D74] rounded-2xl mb-4 shadow-xl shadow-blue-900/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-[#002D74] tracking-tight mb-3">
            Verify Signed Document
            </h1>
            <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
            Upload the original document, signature file, and public key to verify authenticity
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_50px_rgba(0,45,116,0.05)] p-8 md:p-10">
            <div className="grid gap-6">
              <FileUploadSlot 
                label="Original Document" 
                file={originalFile} 
                onChange={handleOriginalFileChange} 
                icon={FaRegFileAlt}
                accept=".pdf,.doc,.docx,.txt,.json"
              />
              
              <FileUploadSlot 
                label="Signature File" 
                file={signatureFile} 
                onChange={handleSignatureFileChange} 
                icon={FaSignature}
                accept=".txt"
              />
              
              <FileUploadSlot 
                label="Public Key" 
                file={publicKeyFile} 
                onChange={handlePublicKeyFileChange} 
                icon={FaKey}
                accept=".txt"
              />

              <div className="pt-4">
                <Button 
                  onClick={handleVerify} 
                  disabled={loading} 
                  className="w-full h-14 bg-[#002D74] hover:bg-[#001e52] text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin w-6 h-6" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <MdOutlineVerified className="w-6 h-6" />
                      <span>Verify Authenticity</span>
                    </div>
                  )}
                </Button>
                
                <p className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" />
                  All processing happens locally in your browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyDocument;