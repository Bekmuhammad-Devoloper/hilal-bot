"use client";
import { useEffect, useState } from "react";
import { getPayments, confirmPayment, cancelPayment, getPaymentStats } from "@/lib/api";

export default function PaymentsPage() {
  const [data, setData] = useState<any>({ payments: [], total: 0, totalPages: 0 });
  const [stats, setStats] = useState<any>({ pending: 0, completedPayments: 0, cancelled: 0, failed: 0, totalRevenue: 0 });
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
  const formatDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: JSX.Element }> = {
    pending: {
      bg: "bg-amber-50", text: "text-amber-600", label: "Kutilmoqda",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" /></svg>,
    },
    completed: {
      bg: "bg-emerald-50", text: "text-emerald-600", label: "Tasdiqlangan",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    },
    cancelled: {
      bg: "bg-red-50", text: "text-red-500", label: "Bekor",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    },
    failed: {
      bg: "bg-slate-50", text: "text-slate-500", label: "Xato",
      icon: <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    },
  };

  const statCards = [
    { label: "Kutilmoqda", value: stats.pending || 0, gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Tasdiqlangan", value: stats.completedPayments || 0, gradient: "from-emerald-500 to-teal-600", iconBg: "bg-emerald-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Bekor/Xato", value: (stats.cancelled || 0) + (stats.failed || 0), gradient: "from-rose-500 to-red-600", iconBg: "bg-rose-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: "Jami daromad", value: fmt(stats.totalRevenue || 0), gradient: "from-violet-500 to-indigo-600", iconBg: "bg-violet-400/20",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">To'lovlar</h1>
        <p className="text-sm text-slate-400 mt-0.5">Jami: {data.total || 0}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center mb-3`}>{c.icon}</div>
              <p className="text-xl font-bold">{c.value}</p>
              <p className="text-sm text-white/70 mt-0.5">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { val: "", label: "Barchasi" },
          { val: "pending", label: "Kutilmoqda" },
          { val: "completed", label: "Tasdiqlangan" },
          { val: "cancelled", label: "Bekor" },
          { val: "failed", label: "Xato" },
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
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reja</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Summa</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Usul</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sana</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.payments?.map((p: any) => {
                const sc = statusConfig[p.status] || statusConfig.failed;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">#{p.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {p.user?.photoUrl ? (
                          <img src={p.user.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                            {p.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 text-[13px]">{p.user?.firstName || "?"}</p>
                          <p className="text-[10px] text-slate-400">{p.user?.telegramId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{p.plan?.name || "?"}</td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{fmt(p.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 font-medium text-slate-600">
                        <img src={p.method === "payme" ? "/payme-01.png" : "/click-01.png"} alt={p.method} className="h-4 w-4 object-contain" />
                        {p.method === "payme" ? "Payme" : "Click"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-400">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      {p.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleConfirm(p.id)} title="Tasdiqlash"
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          </button>
                          <button onClick={() => handleCancel(p.id)} title="Bekor qilish"
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
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
