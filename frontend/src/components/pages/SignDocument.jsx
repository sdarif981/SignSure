import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { FaFileUpload, FaQrcode } from "react-icons/fa";
import { MdOutlineLock, MdOutlineFileDownload } from "react-icons/md";
import { Loader2 } from "lucide-react";
import Navbar from "../pages/Navbar";
import Footer from "../pages/Footer";
import { decrypt_key } from "@/utils/decrypt_key";

const SignDocument = () => {
  const [file, setFile] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  // Check for encrypted private key in localStorage
  const checkForKey = useCallback(() => {
    const keyExists = !!localStorage.getItem("encryptedPrivateKey");
    setHasKey(keyExists);
  }, []);

  useEffect(() => {
    // Initial check
    checkForKey();

    // Listen for storage events (changes from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === "encryptedPrivateKey" || e.key === null) {
        checkForKey();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Poll localStorage periodically to detect changes made in same tab (DevTools)
    // This is necessary because storage events don't fire for same-tab changes
    const intervalId = setInterval(() => {
      checkForKey();
    }, 500); // Check every 500ms

    // Also check when window regains focus (user might have removed key in DevTools)
    const handleFocus = () => {
      checkForKey();
    };
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(intervalId);
    };
  }, [checkForKey]);

  // Also check when uploadCount changes (after QR upload)
  useEffect(() => {
    checkForKey();
  }, [uploadCount]);

  // ---------- Helpers ----------
  const abToHex = (buf) =>
    Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const base64ToArrayBuffer = (b64) => {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  const ensureArrayBuffer = (maybeBufferOrString) => {
    if (!maybeBufferOrString) return null;
    if (maybeBufferOrString instanceof ArrayBuffer) return maybeBufferOrString;
    if (ArrayBuffer.isView(maybeBufferOrString)) return maybeBufferOrString.buffer;
    if (typeof maybeBufferOrString === "string") {
      const s = maybeBufferOrString.trim();
      const isLikelyBase64 = /^[A-Za-z0-9+/=\s]+$/.test(s) && s.replace(/\s+/g, "").length % 4 === 0;
      if (isLikelyBase64) {
        return base64ToArrayBuffer(s);
      }
      const m = s.match(/-----BEGIN [^-]+-----([\s\S]+)-----END [^-]+-----/);
      if (m && m[1]) {
        const body = m[1].replace(/\s+/g, "");
        return base64ToArrayBuffer(body);
      }
    }
    return null;
  };

  // ---------- File + QR handlers ----------
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 10 * 1024 * 1024) { // Limit to 10MB
      toast.error("Document file is too large (max 10MB).");
      return;
    }
    setFile(f);
  };

  const handleQRUpload = (e) => {
    const qrFile = e.target.files?.[0];
    if (!qrFile) {
      toast.error("No QR file selected.");
      return;
    }
    if (!qrFile.type.startsWith("image/") || !["image/png", "image/jpeg"].includes(qrFile.type)) {
      toast.error("Please upload a PNG or JPEG image.");
      return;
    }
    if (qrFile.size > 5 * 1024 * 1024) { // Limit to 5MB
      toast.error("QR image file is too large (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result !== "string") {
        toast.error("Failed to read QR image.");
        console.error("FileReader result is not a string:", result);
        return;
      }
      const img = new Image();
      img.onload = () => {
        console.log("QR image loaded:", { width: img.width, height: img.height });
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          toast.error("Canvas not supported in this browser.");
          console.error("Canvas context not available.");
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log("Image data retrieved:", { width: imageData.width, height: imageData.height });
        const code = jsQR(imageData.data, canvas.width, canvas.height);
        if (code?.data) {
          const qrData = code.data.trim();
          if (!/^[A-Za-z0-9+/=]+$/.test(qrData) || qrData.replace(/\s+/g, "").length % 4 !== 0) {
            toast.error("QR code does not contain a valid base64-encoded private key.");
            console.error("Invalid QR code data format:", qrData);
            return;
          }
          console.log("QR code data:", qrData);
          localStorage.setItem("encryptedPrivateKey", qrData);
          setHasKey(true);
          setUploadCount((p) => p + 1);
          toast.success("Encrypted private key loaded from QR.");
        } else {
          toast.error("No QR data found or QR unreadable. Ensure the image contains a clear QR code.");
          console.error("jsQR failed to detect QR code:", code);
        }
      };
      img.onerror = () => {
        toast.error("Invalid or corrupted image file.");
        console.error("Failed to load QR image.");
      };
      img.src = result;
    };
    reader.onerror = () => {
      toast.error("Failed to read QR file.");
      console.error("FileReader error:", reader.error);
    };
    reader.readAsDataURL(qrFile);
  };

 

  // ---------- Main signing flow ----------
  const handleSign = async () => {
    if (!file) {
      toast.error("Please choose a file to sign.");
      return;
    }
    if (!passphrase) {
      toast.error("Please enter your passphrase.");
      return;
    }
    const encryptedKey = localStorage.getItem("encryptedPrivateKey");
    if (!encryptedKey) {
      toast.error("No encrypted private key found. Upload QR first.");
      return;
    }

    setLoading(true);
    try {
      const decrypted = await decrypt_key(encryptedKey, passphrase);
      const keyBuffer = ensureArrayBuffer(decrypted);
      if (!keyBuffer) {
        throw new Error("Decrypted key is not in a supported format (expected ArrayBuffer or base64).");
      }

      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        { name: "ECDSA", namedCurve: "P-384" },
        false,
        ["sign"]
      );

      const fileBytes = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest("SHA-384", fileBytes);
      const hashHex = abToHex(hashBuffer);

      const signatureBuffer = await window.crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-384" } },
        privateKey,
        fileBytes
      );

      const signatureHex = abToHex(signatureBuffer);

      const content = [
        "Signed by SignSure",
        `Original File: ${file.name}`,
        `SHA-384 Hash: ${hashHex}`,
        "Signature (hex, raw r||s, ECDSA P-384):",
        signatureHex,
      ].join("\n");

      const blob = new Blob([content], { type: "text/plain" });
      saveAs(blob, `${file.name}.sig.txt`);

      toast.success("File signed and downloaded.");
      setFile(null);
      setPassphrase("");
    } catch (err) {
      console.error("Signing error:", err);
      toast.error(err?.message || "Signing failed. Check passphrase and key format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-150px)] bg-gray-50 py-16 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white border border-[#002D74]/10 rounded-xl shadow-xl px-8 py-10 space-y-10 relative z-10">
          <h1 className="text-3xl font-bold text-[#002D74] text-center">Sign Your Document</h1>

          <div className={`p-4 rounded-lg text-sm ${
            hasKey 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}>
            <div className="flex items-start gap-2">
              <span className="font-semibold">{hasKey ? "✓" : "!"}</span>
              <div>
                <p className="font-medium mb-1">
                  {hasKey ? "Encrypted private key is loaded" : "Private key required"}
                </p>
                <p className="text-xs opacity-90">
                  {hasKey 
                    ? "You can now sign documents. Make sure to enter your passphrase to decrypt the key."
                    : "Upload your QR code backup to load your encrypted private key."}
                </p>
              </div>
            </div>
          </div>

          {/* Document upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#002D74]">Upload Document</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#002D74] text-white rounded-md hover:bg-[#001e52] transition-all">
                <FaFileUpload className="w-5 h-5" />
                {file ? "Change File" : "Choose File"}
                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,.json" className="hidden" />
              </label>
              {file && <p className="text-sm text-gray-600 truncate max-w-[200px]">{file.name}</p>}
            </div>
          </div>

          {/* QR upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#002D74]">
              Upload QR Code (encrypted private key)
            </label>
            <div className="flex items-center gap-3">
              <label
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  hasKey
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#002D74] text-white cursor-pointer hover:bg-[#001e52]"
                }`}
              >
                <FaQrcode className="w-5 h-5" />
                {hasKey ? "QR Code Loaded" : "Upload QR Code"}
                <input
                  type="file"
                  onChange={handleQRUpload}
                  accept="image/png,image/jpeg"
                  className="hidden"
                  disabled={hasKey}
                />
              </label>
            </div>
          </div>

          {/* Download QR */}
          

          {/* Passphrase */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#002D74]">Passphrase</label>
            <div className="relative">
              <Input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase"
                className="pr-12 border-[#002D74]/40"
              />
              <MdOutlineLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#002D74]/60 w-5 h-5" />
            </div>
          </div>

          {/* Sign button */}
          <Button
            onClick={handleSign}
            disabled={loading}
            className="w-full bg-[#002D74] hover:bg-[#001e52] text-white font-semibold py-3"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin w-5 h-5" />
                Signing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <MdOutlineFileDownload className="w-5 h-5" />
                Sign and Download
              </div>
            )}
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SignDocument;