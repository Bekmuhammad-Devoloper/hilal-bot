"use client";
import { useState } from "react";
import { broadcastAll } from "@/lib/api";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    if (!message.trim()) return alert("Xabar yozing!");
    if (!confirm("Barcha foydalanuvchilarga yuborishni tasdiqlaysizmi?")) return;
    setLoading(true);
    try {
      const r = await broadcastAll(message);
      setResult(r);
      setMessage("");
    } catch (e: any) {
      alert("Xatolik: " + (e.message || "Noma'lum"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📢 Xabar yuborish</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">Xabar matni</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full border rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Barcha foydalanuvchilarga yuboriladigan xabarni yozing...&#10;&#10;HTML formatlash qo'llab-quvvatlanadi:&#10;<b>Qalin matn</b>&#10;<i>Kursiv matn</i>&#10;<a href='link'>Havola</a>"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {message.length} belgi
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Yuborilmoqda..." : "📤 Yuborish"}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-green-50 rounded-lg p-4">
            <h3 className="font-bold text-green-700 mb-2">✅ Natija</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Yuborildi:</div>
              <div className="font-medium text-green-600">{result.success || 0}</div>
              <div className="text-gray-600">Xato:</div>
              <div className="font-medium text-red-600">{result.failed || 0}</div>
              <div className="text-gray-600">Jami:</div>
              <div className="font-medium text-gray-800">{result.total || 0}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h3 className="font-bold text-blue-700 mb-3">💡 Maslahatlar</h3>
        <ul className="text-sm text-blue-600 space-y-2">
          <li>• HTML formatlash ishlatishingiz mumkin: <code className="bg-blue-100 px-1 rounded">&lt;b&gt;</code>, <code className="bg-blue-100 px-1 rounded">&lt;i&gt;</code>, <code className="bg-blue-100 px-1 rounded">&lt;a&gt;</code></li>
          <li>• Emoji ishlatish mumkin 🎉</li>
          <li>• Xabar barcha foydalanuvchilarga (bloklanmaganlar) yuboriladi</li>
          <li>• Katta sonli foydalanuvchilar bo'lsa, yuborish biroz vaqt olishi mumkin</li>
        </ul>
      </div>
    </div>
  );
}
