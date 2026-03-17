"use client";
import { useEffect, useState } from "react";
import { getStats, getSubStats, getPaymentStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({});
  const [subStats, setSubStats] = useState<any>({});
  const [payStats, setPayStats] = useState<any>({});

  useEffect(() => {
    Promise.all([getStats(), getSubStats(), getPaymentStats()])
      .then(([s, ss, ps]) => { setStats(s); setSubStats(ss); setPayStats(ps); })
      .catch(console.error);
  }, []);

  const cards = [
    { icon: "👥", label: "Jami foydalanuvchilar", value: stats.totalUsers || 0, color: "bg-blue-50 text-blue-600" },
    { icon: "🆕", label: "Bugungi yangi", value: stats.todayUsers || 0, color: "bg-green-50 text-green-600" },
    { icon: "💎", label: "Aktiv obunalar", value: subStats.activeSubs || stats.activeSubs || 0, color: "bg-purple-50 text-purple-600" },
    { icon: "💳", label: "Jami to'lovlar", value: payStats.completedPayments || 0, color: "bg-orange-50 text-orange-600" },
    { icon: "💰", label: "Jami daromad", value: `${((payStats.totalRevenue || stats.totalRevenue || 0)).toLocaleString()} so'm`, color: "bg-emerald-50 text-emerald-600" },
    { icon: "🔑", label: "Adminlar", value: stats.totalAdmins || 0, color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.color} rounded-xl p-5`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm opacity-70">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
