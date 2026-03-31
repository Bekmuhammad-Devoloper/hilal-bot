"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";

/* ─── Mini Bar Chart (pure CSS) ─── */
function BarChart({ data, dataKey, color, label }: { data: any[]; dataKey: string; color: string; label: string }) {
  const max = Math.max(...data.map((d) => d[dataKey] || 0), 1);
  const dayNames = ["Yak", "Du", "Se", "Chor", "Pay", "Ju", "Sha"];
  return (
    <div>
      <div className="flex items-end gap-1.5 h-[140px] px-1">
        {data.map((d, i) => {
          const val = d[dataKey] || 0;
          const pct = Math.max((val / max) * 100, 4);
          const dayIdx = new Date(d.date).getDay();
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="text-[10px] font-medium text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {dataKey === "revenue" ? `${(val / 1000).toFixed(0)}k` : val}
              </div>
              <div className="w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80" style={{ height: `${pct}%`, background: `linear-gradient(to top, ${color}, ${color}99)` }} />
              <span className="text-[10px] text-slate-400 font-medium">{dayNames[dayIdx]}</span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">{label}</p>
    </div>
  );
}

/* ─── Donut Chart (SVG) ─── */
function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 42; const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 100 100" className="flex-shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * c;
          const gap = c - dash;
          const o = offset;
          offset += dash;
          return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="12" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-o} strokeLinecap="round" className="transition-all duration-700" />;
        })}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="text-[14px] font-bold fill-slate-700 rotate-90 origin-center">{total}</text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-[12px] text-slate-500">{seg.label}</span>
            <span className="text-[12px] font-semibold text-slate-700">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [subStats, setSubStats] = useState<any>({});
  const [payStats, setPayStats] = useState<any>({});
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((d) => {
        setStats(d.stats || {});
        setSubStats(d.subStats || {});
        setPayStats(d.paymentStats || {});
        setRecentPayments(Array.isArray(d.recentPayments) ? d.recentPayments : []);
        setRecentUsers(Array.isArray(d.recentUsers) ? d.recentUsers : []);
        setWeeklyData(Array.isArray(d.weekly) ? d.weekly : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalUsers = stats.totalUsers || 0;
  const todayUsers = stats.todayUsers || 0;
  const activeSubs = subStats.activeSubs || stats.activeSubs || 0;
  const completedPayments = payStats.completedPayments || 0;
  const totalRevenue = payStats.totalRevenue || stats.totalRevenue || 0;
  const todayRevenue = payStats.todayRevenue || 0;
  const todayPayments = payStats.todayPayments || 0;
  const totalAdmins = stats.totalAdmins || 0;

  const formatMoney = (n: number) => n.toLocaleString("uz-UZ") + " so'm";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  const cards = [
    {
      label: "Jami foydalanuvchilar",
      value: totalUsers,
      sub: `+${todayUsers} bugun`,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Aktiv obunalar",
      value: activeSubs,
      sub: `${totalUsers > 0 ? Math.round((activeSubs / totalUsers) * 100) : 0}% konversiya`,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      label: "Jami daromad",
      value: formatMoney(totalRevenue),
      sub: `+${formatMoney(todayRevenue)} bugun`,
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Jami to'lovlar",
      value: completedPayments,
      sub: `+${todayPayments} bugun`,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-400/20",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
    },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Ma'lumotlar yuklanmoqda...</p>
      </div>
    </div>
  );

  const conversionRate = totalUsers > 0 ? Math.round((activeSubs / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.gradient} rounded-2xl p-5 text-white relative overflow-hidden group hover:shadow-lg transition-shadow duration-300`}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -right-1 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>{c.icon}</div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{c.value}</p>
              <p className="text-sm text-white/70 mt-0.5">{c.label}</p>
              <p className="text-xs text-white/50 mt-1 font-medium">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Bugungi yangi", value: todayUsers, gradient: "from-sky-400 to-blue-500", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          )},
          { label: "Adminlar", value: totalAdmins, gradient: "from-amber-400 to-orange-500", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          )},
          { label: "Bugungi to'lovlar", value: todayPayments, gradient: "from-rose-400 to-pink-500", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
          )},
          { label: "Bugungi daromad", value: formatMoney(todayRevenue), gradient: "from-emerald-400 to-green-500", icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )},
        ].map((q, i) => (
          <div key={i} className={`bg-gradient-to-br ${q.gradient} rounded-2xl p-4 text-white relative overflow-hidden group hover:shadow-lg transition-shadow duration-300`}>
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{q.icon}</div>
                <span className="text-[11px] text-white/80 font-medium uppercase tracking-wide">{q.label}</span>
              </div>
              <p className="text-xl font-bold tracking-tight">{q.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800">Konversiya darajasi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Foydalanuvchilardan obunachilarga o'tish</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-slate-800">{conversionRate}%</span>
            <p className="text-xs text-slate-400">{activeSubs} / {totalUsers}</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(conversionRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-slate-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Weekly Charts ── */}
      {weeklyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800">Yangi foydalanuvchilar</h3>
                <p className="text-[11px] text-slate-400">Haftalik statistika</p>
              </div>
            </div>
            <BarChart data={weeklyData} dataKey="users" color="#3b82f6" label="So'nggi 7 kun" />
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Jami hafta</span>
              <span className="text-sm font-bold text-slate-700">{weeklyData.reduce((s, d) => s + (d.users || 0), 0)} ta</span>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800">Daromad</h3>
                <p className="text-[11px] text-slate-400">Haftalik daromad</p>
              </div>
            </div>
            <BarChart data={weeklyData} dataKey="revenue" color="#10b981" label="So'nggi 7 kun" />
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Jami hafta</span>
              <span className="text-sm font-bold text-slate-700">{formatMoney(weeklyData.reduce((s, d) => s + (d.revenue || 0), 0))}</span>
            </div>
          </div>

          {/* Subscription Donut */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800">Obuna holati</h3>
                <p className="text-[11px] text-slate-400">Joriy taqsimot</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-2">
              <DonutChart segments={[
                { value: subStats.activeSubs || stats.activeSubs || 0, color: "#8b5cf6", label: "Aktiv" },
                { value: subStats.expiredSubs || 0, color: "#f59e0b", label: "Tugagan" },
                { value: subStats.cancelledSubs || 0, color: "#ef4444", label: "Bekor" },
                { value: Math.max(0, totalUsers - (subStats.activeSubs || stats.activeSubs || 0) - (subStats.expiredSubs || 0) - (subStats.cancelledSubs || 0)), color: "#e2e8f0", label: "Obunasiz" },
              ]} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-800">So'nggi to'lovlar</h3>
            </div>
            <a href="/dashboard/payments" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Barchasini ko'rish →</a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentPayments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-400">To'lovlar topilmadi</p>
              </div>
            ) : recentPayments.map((p: any, i: number) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  p.status === "completed" ? "bg-emerald-50 text-emerald-500" :
                  p.status === "pending" ? "bg-amber-50 text-amber-500" : "bg-red-50 text-red-500"
                }`}>
                  {p.status === "completed" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  ) : p.status === "pending" ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-700 truncate">{p.user?.firstName || `ID: ${p.telegramId}`}</p>
                  <p className="text-[11px] text-slate-400">{p.plan?.name || "Tarif"} • {p.method || "Noma'lum"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-semibold text-slate-800">{(p.amount || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">{p.createdAt ? formatDate(p.createdAt) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-800">Yangi foydalanuvchilar</h3>
            </div>
            <a href="/dashboard/users" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Barchasini ko'rish →</a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-400">Foydalanuvchilar topilmadi</p>
              </div>
            ) : recentUsers.map((u: any, i: number) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                {u.photoUrl ? (
                  <img src={u.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                    {u.firstName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-700 truncate">{u.firstName || "Noma'lum"} {u.lastName || ""}</p>
                  <p className="text-[11px] text-slate-400">@{u.username || "username yo'q"}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    {u.isAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-600">ADMIN</span>
                    )}
                    {u.isBlocked ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-500">BLOCKED</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-500">AKTIV</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{u.createdAt ? formatDate(u.createdAt) : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="text-[14px] font-semibold text-slate-800">Daromad xulosasi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Jami daromad</p>
            <p className="text-xl font-bold text-slate-800">{formatMoney(totalRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
            <p className="text-xs text-emerald-500 font-medium mb-1">Bugungi daromad</p>
            <p className="text-xl font-bold text-emerald-700">{formatMoney(todayRevenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4">
            <p className="text-xs text-indigo-500 font-medium mb-1">O'rtacha to'lov</p>
            <p className="text-xl font-bold text-indigo-700">{formatMoney(completedPayments > 0 ? Math.round(totalRevenue / completedPayments) : 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
