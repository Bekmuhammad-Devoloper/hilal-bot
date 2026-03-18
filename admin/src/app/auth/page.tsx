"use client";"use client";

import { Suspense, useEffect, useState } from "react";import { Suspense, useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";import { useSearchParams } from "next/navigation";



const API = typeof window !== "undefined" && window.location.hostname === "localhost"function AuthCallbackInner() {

  ? "http://localhost:7777/api"  const searchParams = useSearchParams();

  : "/api";  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");



function AuthCallbackInner() {  useEffect(() => {

  const searchParams = useSearchParams();    const code = searchParams.get("code");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");    if (!code) { setStatus("error"); return; }

    fetch("http://localhost:1001/api/auth/login-code", {

  useEffect(() => {      method: "POST",

    const code = searchParams.get("code");      headers: { "Content-Type": "application/json" },

    if (!code) { setStatus("error"); return; }      body: JSON.stringify({ code }),

    fetch(`${API}/auth/login-code`, {    })

      method: "POST",      .then((r) => r.json())

      headers: { "Content-Type": "application/json" },      .then((data) => {

      body: JSON.stringify({ code }),        if (data.token) {

    })          localStorage.setItem("token", data.token);

      .then((r) => r.json())          setStatus("success");

      .then((data) => {          setTimeout(() => (window.location.href = "/dashboard"), 1000);

        if (data.token) {        } else {

          localStorage.setItem("token", data.token);          setStatus("error");

          setStatus("success");        }

          setTimeout(() => (window.location.href = "/dashboard"), 1000);      })

        } else {      .catch(() => setStatus("error"));

          setStatus("error");  }, [searchParams]);

        }

      })  return (

      .catch(() => setStatus("error"));    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">

  }, [searchParams]);      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center">

        <div className="text-5xl mb-4">{status === "loading" ? "⏳" : status === "success" ? "✅" : "❌"}</div>

  return (        {status === "loading" && <p className="text-gray-500">Tekshirilmoqda...</p>}

    <div className="min-h-screen flex items-center justify-center bg-gray-50">        {status === "success" && <p className="text-green-600 font-bold">Muvaffaqiyatli! Yo'naltirilmoqda...</p>}

      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-sm border">        {status === "error" && (

        {status === "loading" && (          <>

          <>            <p className="text-red-600 font-bold mb-4">Kod yaroqsiz!</p>

            <div className="relative w-20 h-20 mx-auto mb-5">            <a href="/" className="text-indigo-600 underline">Qayta urinish</a>

              <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />          </>

              <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />        )}

            </div>      </div>

            <p className="text-gray-500">Tekshirilmoqda...</p>    </div>

          </>  );

        )}}

        {status === "success" && (

          <>export default function AuthCallback() {

            <div className="w-20 h-20 bg-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-5">  return (

              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>⏳</p></div>}>

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />      <AuthCallbackInner />

              </svg>    </Suspense>

            </div>  );

            <p className="text-green-600 font-bold text-lg">Muvaffaqiyatli!</p>}

            <p className="text-gray-400 text-sm mt-1">Yo{"'"}naltirilmoqda...</p>
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
