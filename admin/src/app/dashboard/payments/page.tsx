"use client";
import { useEffect, useState } from "react";
import { getPayments, confirmPayment, cancelPayment, getPaymentStats } from "@/lib/api";

export default function PaymentsPage() {
  const [data, setData] = useState<any>({ payments: [], total: 0, totalPages: 0 });
  const [stats, setStats] = useState<any>({ pending: 0, confirmed: 0, cancelled: 0, failed: 0, totalRevenue: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const load = () => {
    getPayments(page, 20, status || undefined).then(setData).catch(console.error);
    getPaymentStats().then(setStats).catch(console.error);
  };
  useEffect(() => { load(); }, [page, status]);

  const handleConfirm = async (id: number) => {
    if (!confirm("To'lovni tasdiqlaysizmi? Obuna yaratiladi.")) return;
    await confirmPayment(id); load();
  };

  const handleCancel = async (id: number) => {
    if (!confirm("To'lovni bekor qilasizmi?")) return;
    await cancelPayment(id); load();
  };

  const fmt = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

  const statusBadge = (s: string) => {
    const map: any = {
      pending: "bg-yellow-100 text-yellow-600",
      confirmed: "bg-green-100 text-green-600",
      cancelled: "bg-red-100 text-red-600",
      failed: "bg-gray-100 text-gray-600",
    };
    const label: any = { pending: "⏳ Kutilmoqda", confirmed: "✅ Tasdiqlangan", cancelled: "❌ Bekor", failed: "⚠️ Xato" };
    return <span className={`text-xs px-2 py-1 rounded ${map[s] || "bg-gray-100"}`}>{label[s] || s}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">💳 To'lovlar</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
          <div className="text-sm text-yellow-500">Kutilmoqda</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed || 0}</div>
          <div className="text-sm text-green-500">Tasdiqlangan</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled || 0}</div>
          <div className="text-sm text-red-500">Bekor</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{stats.failed || 0}</div>
          <div className="text-sm text-gray-500">Xato</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-xl font-bold text-indigo-600">{fmt(stats.totalRevenue || 0)}</div>
          <div className="text-sm text-indigo-500">Jami daromad</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "pending", "confirmed", "cancelled", "failed"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-sm ${status === s ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border"}`}>
            {s === "" ? "Barchasi" : s === "pending" ? "Kutilmoqda" : s === "confirmed" ? "Tasdiqlangan" : s === "cancelled" ? "Bekor" : "Xato"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-gray-600">Foydalanuvchi</th>
              <th className="px-4 py-3 text-left text-gray-600">Reja</th>
              <th className="px-4 py-3 text-left text-gray-600">Summa</th>
              <th className="px-4 py-3 text-left text-gray-600">Usul</th>
              <th className="px-4 py-3 text-left text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-gray-600">Sana</th>
              <th className="px-4 py-3 text-left text-gray-600">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {data.payments?.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">#{p.id}</td>
                <td className="px-4 py-3 text-gray-800">{p.user?.firstName || "?"} <span className="text-gray-400 text-xs">({p.user?.telegramId})</span></td>
                <td className="px-4 py-3 text-gray-800">{p.plan?.name || "?"}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{fmt(p.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${p.method === "payme" ? "bg-cyan-100 text-cyan-600" : "bg-blue-100 text-blue-600"}`}>
                    {p.method === "payme" ? "💠 Payme" : "💳 Click"}
                  </span>
                </td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {p.status === "pending" && (
                    <div className="flex gap-1">
                      <button onClick={() => handleConfirm(p.id)} className="px-2 py-1 rounded text-xs bg-green-100 text-green-600 hover:bg-green-200">✅</button>
                      <button onClick={() => handleCancel(p.id)} className="px-2 py-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200">❌</button>
                    </div>
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
