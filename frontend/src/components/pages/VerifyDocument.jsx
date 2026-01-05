// VerifyDocument.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaFileUpload } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";

const VerifyDocument = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [publicKeyFile, setPublicKeyFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper to convert hex string to ArrayBuffer
  const hexToArrayBuffer = (hex) => {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return bytes.buffer;
  };

  // Helper to convert base64 to ArrayBuffer
  const base64ToArrayBuffer = (b64) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  // Handle file uploads
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

  // Main verification function
  const handleVerify = async () => {
    if (!originalFile || !signatureFile || !publicKeyFile) {
      toast.error("Please upload all required files: original document, signature, and public key.");
      return;
    }

    setLoading(true);
    try {
      // Read signature file
      const signatureText = await signatureFile.text();
      const lines = signatureText.split('\n');
      const signatureHex = lines.find(line => line.match(/^[0-9a-fA-F]+$/))?.trim();
      
      if (!signatureHex) {
        throw new Error("Invalid signature file format: signature hex not found.");
      }

      // Read public key (expecting base64-encoded SPKI)
      const publicKeyText = await publicKeyFile.text();
      const publicKeyBuffer = base64ToArrayBuffer(publicKeyText.trim());

      // Import public key
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        { name: "ECDSA", namedCurve: "P-384" },
        false,
        ["verify"]
      );

      // Read original file bytes
      const fileBytes = await originalFile.arrayBuffer();
      
      // Convert signature hex to ArrayBuffer
      const signatureBuffer = hexToArrayBuffer(signatureHex);

      // Verify signature
      const isValid = await window.crypto.subtle.verify(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        publicKey,
        signatureBuffer,
        fileBytes
      );

      if (isValid) {
        toast.success("Signature verification successful! The document is authentic.");
      } else {
        toast.error("Signature verification failed. The document or signature is invalid.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err?.message || "Verification failed. Check file formats and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-150px)] bg-gray-50 py-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-[#002D74]/10 rounded-xl shadow-xl px-8 py-10 space-y-10 relative z-10">
          <h1 className="text-3xl font-bold text-[#002D74] text-center mb-2">Verify Signed Document</h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Upload the original document, signature file, and public key to verify authenticity
          </p>

          {/* Original Document upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#002D74]">Original Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#002D74] text-white rounded-md hover:bg-[#001e52] transition-all">
                <FaFileUpload className="w-5 h-5" />
                {originalFile ? "Change Document" : "Upload Document"}
                <input 
                  type="file" 
                  onChange={handleOriginalFileChange} 
                  accept=".pdf,.doc,.docx,.txt,.json" 
                  className="hidden" 
                />
              </label>
              {originalFile && <p className="text-sm text-gray-600 truncate max-w-[200px]">{originalFile.name}</p>}
            </div>
          </div>

          {/* Signature file upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#002D74]">Signature File (.sig.txt)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#002D74] text-white rounded-md hover:bg-[#001e52] transition-all">
                <FaFileUpload className="w-5 h-5" />
                {signatureFile ? "Change Signature" : "Upload Signature"}
                <input 
                  type="file" 
                  onChange={handleSignatureFileChange} 
                  accept=".txt" 
                  className="hidden" 
                />
              </label>
              {signatureFile && <p className="text-sm text-gray-600 truncate max-w-[200px]">{signatureFile.name}</p>}
            </div>
          </div>

          {/* Public key upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#002D74]">Public Key (base64)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#002D74] text-white rounded-md hover:bg-[#001e52] transition-all">
                <FaFileUpload className="w-5 h-5" />
                {publicKeyFile ? "Change Public Key" : "Upload Public Key"}
                <input 
                  type="file" 
                  onChange={handlePublicKeyFileChange} 
                  accept=".txt" 
                  className="hidden" 
                />
              </label>
              {publicKeyFile && <p className="text-sm text-gray-600 truncate max-w-[200px]">{publicKeyFile.name}</p>}
            </div>
          </div>

          {/* Verify button */}
          <Button 
            onClick={handleVerify} 
            disabled={loading} 
            className="w-full bg-[#002D74] hover:bg-[#001e52] text-white font-semibold py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Verifying...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MdOutlineVerified className="w-5 h-5" />
                Verify Signature
              </div>
            )}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VerifyDocument;