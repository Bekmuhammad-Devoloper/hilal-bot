"use client";
import { useEffect, useState } from "react";
import { getSubscriptions, cancelSubscription, checkExpired, getSubStats } from "@/lib/api";

export default function SubscriptionsPage() {
  const [data, setData] = useState<any>({ subscriptions: [], total: 0, totalPages: 0 });
  const [stats, setStats] = useState<any>({ active: 0, expired: 0, cancelled: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const load = () => {
    getSubscriptions(page, 20, status || undefined).then(setData).catch(console.error);
    getSubStats().then(setStats).catch(console.error);
  };
  useEffect(() => { load(); }, [page, status]);

  const handleCancel = async (telegramId: number) => {
    if (!confirm("Obunani bekor qilishni tasdiqlaysizmi?")) return;
    await cancelSubscription(telegramId); load();
  };

  const handleCheckExpired = async () => {
    const r = await checkExpired();
    alert(`✅ ${r.expiredCount || 0} ta obuna muddati tugadi`);
    load();
  };

  const statusBadge = (s: string) => {
    const map: any = { active: "bg-green-100 text-green-600", expired: "bg-gray-100 text-gray-600", cancelled: "bg-red-100 text-red-600" };
    const label: any = { active: "✅ Aktiv", expired: "⏰ Tugagan", cancelled: "❌ Bekor" };
    return <span className={`text-xs px-2 py-1 rounded ${map[s] || "bg-gray-100"}`}>{label[s] || s}</span>;
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">📋 Obunalar</h1>
        <button onClick={handleCheckExpired} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">
          ⏰ Muddati o'tganlarni tekshirish
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeSubs || 0}</div>
          <div className="text-sm text-green-500">Aktiv</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.expiredSubs || 0}</div>
          <div className="text-sm text-gray-500">Tugagan</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.cancelledSubs || 0}</div>
          <div className="text-sm text-red-500">Bekor qilingan</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["", "active", "expired", "cancelled"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-sm ${status === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border"}`}>
            {s === "" ? "Barchasi" : s === "active" ? "Aktiv" : s === "expired" ? "Tugagan" : "Bekor"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">Foydalanuvchi</th>
              <th className="px-4 py-3 text-left text-gray-600">Reja</th>
              <th className="px-4 py-3 text-left text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-gray-600">Boshlanish</th>
              <th className="px-4 py-3 text-left text-gray-600">Tugash</th>
              <th className="px-4 py-3 text-left text-gray-600">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {data.subscriptions?.map((s: any) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{s.user?.firstName || "?"} <span className="text-gray-400 text-xs">({s.user?.telegramId})</span></td>
                <td className="px-4 py-3 text-gray-800">{s.plan?.name || "?"}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.startDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(s.endDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {s.status === "active" && (
                    <button onClick={() => handleCancel(s.user?.telegramId)} className="px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200">
                      ❌ Bekor qilish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
