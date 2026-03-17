"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { setStatus("error"); return; }
    fetch("http://localhost:3001/api/auth/login-code", {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">{status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}</div>
        {status === "loading" && <p className="text-gray-500">Tekshirilmoqda...</p>}
        {status === "success" && <p className="text-green-600 font-bold">Muvaffaqiyatli! Yo'naltirilmoqda...</p>}
        {status === "error" && (
          <>
            <p className="text-red-600 font-bold mb-4">Kod yaroqsiz!</p>
            <a href="/" className="text-indigo-600 underline">Qayta urinish</a>
          </>
        )}
      </div>
    </div>
  );
}
