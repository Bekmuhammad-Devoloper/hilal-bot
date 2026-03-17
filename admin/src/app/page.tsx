"use client";
import { useState } from "react";

export default function LoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/auth/login-telegram", {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🇹🇷</div>
          <h1 className="text-2xl font-bold text-gray-800">Oson Turk Tili</h1>
          <p className="text-gray-500 mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleLogin}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram ID</label>
            <input
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
              placeholder="Telegram ID kiriting"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-900 text-white py-3 rounded-lg font-medium hover:bg-indigo-800 transition disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "🔐 Kirish"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          💡 Botda /admin komandasini yozing — avtomatik kirasiz
        </p>
      </div>
    </div>
  );
}
