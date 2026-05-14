import React, { useEffect, useState } from "react";

export default function InstagramCallback() {
  const [status, setStatus] = useState("Connecting Instagram...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code) {
      exchangeCode(code, state);
    } else {
      const errorMsg = urlParams.get("error_description") || urlParams.get("error") || "No code received from Facebook.";
      setError(errorMsg);
      setStatus("Connection failed.");
    }
  }, []);

  const exchangeCode = async (code: string, userId: string | null) => {
    try {
      const response = await fetch("/api/instagram/exchange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, userId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Instagram exchange success:", data);
        setStatus("Instagram connected successfully! Redirecting...");
        // Redirect to dashboard or home after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to exchange code for token.");
        setStatus("Connection failed.");
      }
    } catch (err: any) {
      console.error("Exchange error:", err);
      setError(err.message || "An unexpected error occurred.");
      setStatus("Connection failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{status}</h2>
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}
        {!error && (
          <div className="mt-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <button 
          onClick={() => window.location.href = "/"}
          className="mt-8 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
        >
          Return to DMflow
        </button>
      </div>
    </div>
  );
}
