"use client";
import { useState } from "react";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

export default function LoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login-telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: parseInt(telegramId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Admin huquqi yo'q!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Hilal Bot" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-md" />
          <h1 className="text-2xl font-bold text-gray-900">Hilal Bot</h1>
          <p className="text-gray-400 mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
              {error}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Telegram ID</label>
            <input
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-900 outline-none text-gray-800 text-lg"
              placeholder="Telegram ID kiriting"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-800 transition disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Botda /admin komandasini yozing — avtomatik kirasiz
        </p>
      </div>
    </div>
  );
}
