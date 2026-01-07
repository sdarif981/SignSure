import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import jsQR from "jsqr";
import { FaFileUpload, FaQrcode, FaRegFileAlt } from "react-icons/fa";
import { MdOutlineLock, MdOutlineFileDownload, MdCheckCircle, MdErrorOutline } from "react-icons/md";
import { Loader2, PenTool, ShieldCheck, Key } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { decrypt_key } from "@/utils/decrypt_key";

const SignDocument = () => {
  const [file, setFile] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  // --- LOGIC PRESERVED ---
  const checkForKey = useCallback(() => {
    const keyExists = !!localStorage.getItem("encryptedPrivateKey");
    setHasKey(keyExists);
  }, []);

  useEffect(() => {
    checkForKey();
    const handleStorageChange = (e) => {
      if (e.key === "encryptedPrivateKey" || e.key === null) checkForKey();
    };
    window.addEventListener("storage", handleStorageChange);
    const intervalId = setInterval(() => checkForKey(), 500);
    const handleFocus = () => checkForKey();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [checkForKey]);

  useEffect(() => {
    checkForKey();
  }, [uploadCount, checkForKey]);

  const abToHex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const base64ToArrayBuffer = (b64) => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const ensureArrayBuffer = (maybeBufferOrString) => {
    if (!maybeBufferOrString) return null;
    if (maybeBufferOrString instanceof ArrayBuffer) return maybeBufferOrString;
    if (ArrayBuffer.isView(maybeBufferOrString)) return maybeBufferOrString.buffer;
    if (typeof maybeBufferOrString === "string") {
      const s = maybeBufferOrString.trim();
      if (/^[A-Za-z0-9+/=\s]+$/.test(s) && s.replace(/\s+/g, "").length % 4 === 0) return base64ToArrayBuffer(s);
      const m = s.match(/-----BEGIN [^-]+-----([\s\S]+)-----END [^-]+-----/);
      if (m?.[1]) return base64ToArrayBuffer(m[1].replace(/\s+/g, ""));
    }
    return null;
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 10 * 1024 * 1024) {
      toast.error("Document file is too large (max 10MB).");
      return;
    }
    setFile(f);
  };

  const handleQRUpload = (e) => {
    const qrFile = e.target.files?.[0];
    if (!qrFile) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code?.data) {
          localStorage.setItem("encryptedPrivateKey", code.data.trim());
          setHasKey(true);
          setUploadCount(p => p + 1);
          toast.success("Private key loaded.");
        } else {
          toast.error("QR unreadable.");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(qrFile);
  };

  const handleSign = async () => {
    if (!file || !passphrase) {
      toast.error("File and passphrase required.");
      return;
    }
    setLoading(true);
    try {
      const encryptedKey = localStorage.getItem("encryptedPrivateKey");
      const decrypted = await decrypt_key(encryptedKey, passphrase);
      const keyBuffer = ensureArrayBuffer(decrypted);
      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8", keyBuffer, { name: "ECDSA", namedCurve: "P-384" }, false, ["sign"]
      );
      const fileBytes = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-384", fileBytes);
      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-384" } }, privateKey, fileBytes
      );
      const content = `Signed by SignSure\nOriginal File: ${file.name}\nSHA-384 Hash: ${abToHex(hashBuffer)}\nSignature:\n${abToHex(signatureBuffer)}`;
      saveAs(new Blob([content], { type: "text/plain" }), `${file.name}.sig.txt`);
      toast.success("Document Signed!");
      setFile(null); setPassphrase("");
    } catch (err) {
      toast.error("Signing failed. Check passphrase.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-[#002D74]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[100px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl mb-6 shadow-xl border border-slate-100">
              <PenTool className="w-8 h-8 text-[#002D74]" />
            </div>
            <h1 className="text-4xl font-extrabold text-[#002D74] tracking-tight">Sign your document</h1>
            <p className="text-slate-500 mt-2">Finalize your document with secure encryption.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,45,116,0.1)] p-8 md:p-10">
            {/* Status Alert */}
            <div className={`mb-8 p-4 rounded-2xl border flex gap-4 items-center transition-all ${
              hasKey ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-amber-50 border-amber-100 text-amber-800"
            }`}>
              {hasKey ? <MdCheckCircle className="w-6 h-6 shrink-0" /> : <MdErrorOutline className="w-6 h-6 shrink-0" />}
              <div className="text-sm">
                <p className="font-bold">{hasKey ? "Identity Loaded" : "Identity Required"}</p>
                <p className="opacity-80">{hasKey ? "Private key detected. Ready to sign." : "Please upload your QR key to proceed."}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Document Input */}
              <div className="group">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Document to Sign</label>
                <label className={`relative flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  file ? "border-[#002D74] bg-blue-50/30" : "border-slate-200 hover:border-[#002D74]/40 bg-slate-50/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${file ? "bg-[#002D74] text-white" : "bg-white text-slate-400 shadow-sm"}`}>
                      <FaRegFileAlt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${file ? "text-[#002D74]" : "text-slate-600"}`}>{file ? file.name : "Select Document"}</p>
                      <p className="text-[11px] text-slate-400">{file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF, DOCX, TXT (Max 10MB)"}</p>
                    </div>
                  </div>
                  <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.json" className="hidden" />
                  <FaFileUpload className={`w-4 h-4 ${file ? "text-[#002D74]" : "text-slate-300"}`} />
                </label>
              </div>

              {/* QR Input */}
              {!hasKey && (
                <div className="group">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Identity Key (QR)</label>
                  <label className="relative flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#002D74]/40 bg-slate-50/50 cursor-pointer transition-all">
                    <FaQrcode className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">Scan/Upload QR Key</span>
                    <input type="file" onChange={handleQRUpload} accept="image/*" className="hidden" />
                  </label>
                </div>
              )}

              {/* Passphrase */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Passphrase</label>
                <div className="relative group">
                  <Input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-14 pl-12 bg-slate-50/50 border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#002D74]/20 transition-all"
                  />
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#002D74] transition-colors" />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSign}
                  disabled={loading || !hasKey}
                  className="w-full h-16 bg-[#002D74] hover:bg-[#001e52] text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="animate-spin w-6 h-6" />
                      <span>Encrypting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <MdOutlineFileDownload className="w-6 h-6" />
                      <span>Sign & Download</span>
                    </div>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-6">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter">End-to-End Client-Side Signing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignDocument;