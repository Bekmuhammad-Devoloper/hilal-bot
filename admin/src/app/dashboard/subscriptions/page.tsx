"use client";
import { useEffect, useState } from "react";
import { getSubscriptions, cancelSubscription, checkExpired, getSubStats } from "@/lib/api";

export default function SubscriptionsPage() {
  const [data, setData] = useState<any>({ subscriptions: [], total: 0, totalPages: 0 });
  const [stats, setStats] = useState<any>({ activeSubs: 0, expiredSubs: 0, cancelledSubs: 0 });
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
    alert(`${r.expiredCount || 0} ta obuna muddati tugadi`);
    load();
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
  const total = (stats.activeSubs || 0) + (stats.expiredSubs || 0) + (stats.cancelledSubs || 0);

  const statCards = [
    {
      label: "Aktiv", value: stats.activeSubs || 0, gradient: "from-emerald-500 to-teal-600", iconBg: "bg-emerald-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Tugagan", value: stats.expiredSubs || 0, gradient: "from-slate-400 to-slate-500", iconBg: "bg-white/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Bekor qilingan", value: stats.cancelledSubs || 0, gradient: "from-rose-500 to-red-600", iconBg: "bg-rose-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ];

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
    active: {
      bg: "bg-emerald-50", text: "text-emerald-600", label: "Aktiv",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    },
    expired: {
      bg: "bg-slate-50", text: "text-slate-500", label: "Tugagan",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" /></svg>,
    },
    cancelled: {
      bg: "bg-red-50", text: "text-red-500", label: "Bekor",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Obunalar</h1>
          <p className="text-sm text-slate-400 mt-0.5">Jami: {total}</p>
        </div>
        <button onClick={handleCheckExpired} className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors text-sm font-medium border border-amber-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Muddati o'tganlarni tekshirish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>{c.icon}</div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-white/70 mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { val: "", label: "Barchasi" },
          { val: "active", label: "Aktiv" },
          { val: "expired", label: "Tugagan" },
          { val: "cancelled", label: "Bekor" },
        ].map((s) => (
          <button key={s.val} onClick={() => { setStatus(s.val); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${status === s.val ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reja</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Boshlanish</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tugash</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.subscriptions?.map((s: any) => {
                const sc = statusConfig[s.status] || statusConfig.expired;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {s.user?.photoUrl ? (
                          <img src={s.user.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                            {s.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 text-[13px]">{s.user?.firstName || "?"}</p>
                          <p className="text-[11px] text-slate-400">{s.user?.telegramId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-slate-700">{s.plan?.name || "?"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-400">{formatDate(s.startDate)}</td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-400">{formatDate(s.endDate)}</td>
                    <td className="px-5 py-3.5">
                      {s.status === "active" && (
                        <button onClick={() => handleCancel(s.user?.telegramId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Bekor
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {data.totalPages > 1 && (
        <div className="flex gap-1.5 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
