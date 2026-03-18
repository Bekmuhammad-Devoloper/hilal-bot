"use client";"use client";

import { useState } from "react";import { useState } from "react";



const API = typeof window !== "undefined" && window.location.hostname === "localhost"export default function LoginPage() {

  ? "http://localhost:7777/api"  const [telegramId, setTelegramId] = useState("");

  : "/api";  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

export default function LoginPage() {

  const [telegramId, setTelegramId] = useState("");  const handleLogin = async (e: React.FormEvent) => {

  const [error, setError] = useState("");    e.preventDefault();

  const [loading, setLoading] = useState(false);    setError("");

    setLoading(true);

  const handleLogin = async (e: React.FormEvent) => {    try {

    e.preventDefault();      const res = await fetch("http://localhost:1001/api/auth/login-telegram", {

    setError("");        method: "POST",

    setLoading(true);        headers: { "Content-Type": "application/json" },

    try {        body: JSON.stringify({ telegramId: parseInt(telegramId) }),

      const res = await fetch(`${API}/auth/login-telegram`, {      });

        method: "POST",      const data = await res.json();

        headers: { "Content-Type": "application/json" },      if (!res.ok) throw new Error(data.message || "Xatolik");

        body: JSON.stringify({ telegramId: parseInt(telegramId) }),      localStorage.setItem("token", data.token);

      });      window.location.href = "/dashboard";

      const data = await res.json();    } catch (err: any) {

      if (!res.ok) throw new Error(data.message || "Xatolik");      setError(err.message || "Admin huquqi yo'q!");

      localStorage.setItem("token", data.token);    } finally {

      window.location.href = "/dashboard";      setLoading(false);

    } catch (err: any) {    }

      setError(err.message || "Admin huquqi yo'q!");  };

    } finally {

      setLoading(false);  return (

    }    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">

  };      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        <div className="text-center mb-8">

  return (          <div className="text-5xl mb-3">🇹🇷</div>

    <div className="min-h-screen flex items-center justify-center bg-gray-50">          <h1 className="text-2xl font-bold text-gray-800">Oson Turk Tili</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">          <p className="text-gray-500 mt-1">Admin Panel</p>

        <div className="text-center mb-8">        </div>

          <img src="/logo.jpg" alt="Hilal Bot" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-md" />        <form onSubmit={handleLogin}>

          <h1 className="text-2xl font-bold text-gray-900">Hilal Bot</h1>          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <p className="text-gray-400 mt-1">Admin Panel</p>          <div className="mb-6">

        </div>            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>

        <form onSubmit={handleLogin}>            <input

          {error && (              type="number"

            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">              value={telegramId}

              {error}              onChange={(e) => setTelegramId(e.target.value)}

            </div>              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"

          )}              placeholder="Telegram ID kiriting"

          <div className="mb-6">              required

            <label className="block text-sm font-medium text-gray-600 mb-2">Telegram ID</label>            />

            <input          </div>

              type="number"          <button

              value={telegramId}            type="submit"

              onChange={(e) => setTelegramId(e.target.value)}            disabled={loading}

              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-900 outline-none text-gray-800 text-lg"            className="w-full bg-indigo-900 text-white py-3 rounded-lg font-medium hover:bg-indigo-800 transition disabled:opacity-50"

              placeholder="Telegram ID kiriting"          >

              required            {loading ? "Tekshirilmoqda..." : "🔐 Kirish"}

            />          </button>

          </div>        </form>

          <button        <p className="text-xs text-gray-400 mt-4 text-center">

            type="submit"          💡 Botda /admin komandasini yozing — avtomatik kirasiz

            disabled={loading}        </p>

            className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-800 transition disabled:opacity-50"      </div>

          >    </div>

            {loading ? "Tekshirilmoqda..." : "Kirish"}  );

          </button>}

        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Botda /admin komandasini yozing — avtomatik kirasiz
        </p>
      </div>
    </div>
  );
}
