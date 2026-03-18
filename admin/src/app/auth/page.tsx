"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { setStatus("error"); return; }
    fetch(`${API}/auth/login-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setStatus("success");
          setTimeout(() => (window.location.href = "/dashboard"), 1000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-sm border">
        {status === "loading" && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />
              <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-500">Tekshirilmoqda...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-bold text-lg">Muvaffaqiyatli!</p>
            <p className="text-gray-400 text-sm mt-1">{"Yo'naltirilmoqda..."}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-600 font-bold text-lg mb-2">Kod yaroqsiz!</p>
            <p className="text-gray-400 text-sm mb-4">Botda /admin komandasini qayta yuboring</p>
            <a href="/" className="text-indigo-600 font-medium text-sm">← Bosh sahifaga</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />
          <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
