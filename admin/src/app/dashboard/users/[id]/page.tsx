"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUserDetail, setAdmin, blockUser, sendToUser, cancelSubscription, giftSubscription, getPlans } from "@/lib/api";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "subscriptions" | "payments">("overview");
  const [msgModal, setMsgModal] = useState(false);
  const [msg, setMsg] = useState("");
  const [giftModal, setGiftModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getUserDetail(userId);
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handleToggleAdmin = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      await setAdmin(user.id, !user.isAdmin);
      await load();
    } catch (e) { alert("Xatolik!"); }
    finally { setActionLoading(false); }
  };

  const handleToggleBlock = async () => {
    if (!user) return;
    const action = user.isBlocked ? "Blokdan chiqarish" : "Bloklash";
    if (!confirm(`${action}ni tasdiqlaysizmi?`)) return;
    setActionLoading(true);
    try {
      await blockUser(user.id, !user.isBlocked);
      await load();
    } catch (e) { alert("Xatolik!"); }
    finally { setActionLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!user || !msg.trim()) return;
    setActionLoading(true);
    try {
      await sendToUser(user.telegramId, msg);
      setMsgModal(false);
      setMsg("");
      alert("Xabar yuborildi!");
    } catch (e) { alert("Xatolik!"); }
    finally { setActionLoading(false); }
  };

  const handleCancelSub = async () => {
    if (!user) return;
    if (!confirm("Obunani bekor qilishni tasdiqlaysizmi?")) return;
    setActionLoading(true);
    try {
      await cancelSubscription(user.telegramId);
      await load();
    } catch (e) { alert("Xatolik!"); }
    finally { setActionLoading(false); }
  };

  const handleGiftSub = async () => {
    if (!user || !selectedPlanId) return;
    setActionLoading(true);
    try {
      await giftSubscription(user.telegramId, selectedPlanId);
      setGiftModal(false);
      setSelectedPlanId(null);
      await load();
      alert("Obuna muvaffaqiyatli berildi!");
    } catch (e) { alert("Xatolik!"); }
    finally { setActionLoading(false); }
  };

  const openGiftModal = async () => {
    try {
      const p = await getPlans();
      setPlans(Array.isArray(p) ? p : []);
    } catch {}
    setGiftModal(true);
  };

  const fmt = (n: number) => n?.toLocaleString("uz-UZ") + " so'm";
  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const shortDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Aktiv" },
    expired: { bg: "bg-slate-50", text: "text-slate-500", label: "Tugagan" },
    cancelled: { bg: "bg-red-50", text: "text-red-500", label: "Bekor" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Tasdiqlangan" },
    pending: { bg: "bg-amber-50", text: "text-amber-600", label: "Kutilmoqda" },
    failed: { bg: "bg-slate-50", text: "text-slate-500", label: "Xato" },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-700">Foydalanuvchi topilmadi</p>
        <button onClick={() => router.push("/dashboard/users")} className="mt-4 text-indigo-500 hover:text-indigo-600 text-sm font-medium">← Orqaga</button>
      </div>
    </div>
  );

  const activeSub = user.activeSubscription;
  const daysLeft = activeSub && activeSub.endDate
    ? Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/users")} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Foydalanuvchi profili</h1>
          <p className="text-sm text-slate-400">ID: {user.id} • Telegram: {user.telegramId}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-violet-500 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-6">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                {user.firstName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">{user.firstName} {user.lastName || ""}</h2>
              <p className="text-sm text-slate-400">@{user.username || "—"}</p>
              <div className="flex items-center gap-2 mt-2">
                {user.isAdmin && <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-600">ADMIN</span>}
                <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${user.isBlocked ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
                  {user.isBlocked ? "BLOCKED" : "AKTIV"}
                </span>
                {activeSub && <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-violet-50 text-violet-600">OBUNACHI</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMsgModal(true)} title="Xabar yuborish" className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
              </button>
              <button onClick={handleToggleAdmin} disabled={actionLoading} title={user.isAdmin ? "Admin olib tashlash" : "Admin qilish"} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${user.isAdmin ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
              </button>
              <button onClick={handleToggleBlock} disabled={actionLoading} title={user.isBlocked ? "Blokdan chiqarish" : "Bloklash"} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${user.isBlocked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={user.isBlocked ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"} /></svg>
              </button>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Telegram ID</p>
              <p className="text-sm font-bold text-slate-700 font-mono">{user.telegramId}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Ro{"'"}yxatdan o{"'"}tgan</p>
              <p className="text-sm font-bold text-slate-700">{shortDate(user.createdAt)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Jami to{"'"}lovlar</p>
              <p className="text-sm font-bold text-slate-700">{user.totalPayments || 0} ta</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Jami sarflagan</p>
              <p className="text-sm font-bold text-slate-700">{fmt(user.totalSpent || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Subscription Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSub ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{activeSub ? "Faol obuna" : "Obuna yo'q"}</h3>
              {activeSub && <p className="text-xs text-slate-400">{activeSub.planName || activeSub.plan?.name || "Reja"}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openGiftModal} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
              Sovg{"'"}a obuna
            </button>
            {activeSub && (
              <button onClick={handleCancelSub} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Bekor qilish
              </button>
            )}
          </div>
        </div>
        {activeSub && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-3.5 text-center">
              <p className="text-[11px] text-emerald-600/60 font-medium mb-1">Qolgan kunlar</p>
              <p className="text-2xl font-black text-emerald-700">{daysLeft}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 text-center">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Boshlanish</p>
              <p className="text-sm font-bold text-slate-700">{shortDate(activeSub.startDate)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 text-center">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Tugash</p>
              <p className="text-sm font-bold text-slate-700">{shortDate(activeSub.endDate)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["overview", "subscriptions", "payments"] as const).map((t) => {
          const labels = { overview: "Umumiy", subscriptions: "Obunalar", payments: "To'lovlar" };
          const counts = {
            overview: null,
            subscriptions: user.subscriptions?.length || 0,
            payments: user.payments?.length || 0,
          };
          return (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>
              {labels[t]} {counts[t] !== null ? `(${counts[t]})` : ""}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Subscriptions */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-slate-800">Oxirgi obunalar</h3>
              <button onClick={() => setTab("subscriptions")} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Barchasini →</button>
            </div>
            <div className="divide-y divide-slate-50">
              {(user.subscriptions || []).slice(0, 3).map((s: any) => {
                const sc = statusConfig[s.status] || statusConfig.expired;
                return (
                  <div key={s.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-slate-700">{s.planName || s.plan?.name || "Reja"}</p>
                      <p className="text-[11px] text-slate-400">{shortDate(s.startDate)} → {shortDate(s.endDate)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span>
                  </div>
                );
              })}
              {(!user.subscriptions || user.subscriptions.length === 0) && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">Obunalar yo{"'"}q</div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-slate-800">Oxirgi to{"'"}lovlar</h3>
              <button onClick={() => setTab("payments")} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Barchasini →</button>
            </div>
            <div className="divide-y divide-slate-50">
              {(user.payments || []).slice(0, 3).map((p: any) => {
                const sc = statusConfig[p.status] || statusConfig.failed;
                return (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={p.method === "payme" ? "/payme-01.png" : "/click-01.png"} alt={p.method} className="h-5 object-contain" />
                      <div>
                        <p className="text-[13px] font-medium text-slate-700">{p.planName || p.plan?.name || "Reja"}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(p.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-slate-800">{fmt(p.amount)}</p>
                      <span className={`text-[10px] font-semibold ${sc.text}`}>{sc.label}</span>
                    </div>
                  </div>
                );
              })}
              {(!user.payments || user.payments.length === 0) && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">To{"'"}lovlar yo{"'"}q</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reja</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Boshlanish</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tugash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(user.subscriptions || []).map((s: any) => {
                  const sc = statusConfig[s.status] || statusConfig.expired;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">#{s.id}</span></td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{s.planName || s.plan?.name || "?"}</td>
                      <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-400">{shortDate(s.startDate)}</td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-400">{shortDate(s.endDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!user.subscriptions || user.subscriptions.length === 0) && (
            <div className="py-12 text-center text-sm text-slate-400">Obunalar yo{"'"}q</div>
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reja</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Summa</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Usul</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(user.payments || []).map((p: any) => {
                  const sc = statusConfig[p.status] || statusConfig.failed;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">#{p.id}</span></td>
                      <td className="px-5 py-3.5 text-[13px] font-medium text-slate-700">{p.planName || p.plan?.name || "?"}</td>
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{fmt(p.amount)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <img src={p.method === "payme" ? "/payme-01.png" : "/click-01.png"} alt={p.method} className="h-4 object-contain" />
                          <span className="text-[11px] text-slate-500">{p.method === "payme" ? "Payme" : "Click"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!user.payments || user.payments.length === 0) && (
            <div className="py-12 text-center text-sm text-slate-400">To{"'"}lovlar yo{"'"}q</div>
          )}
        </div>
      )}

      {/* Send Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">{user.firstName?.charAt(0)?.toUpperCase() || "?"}</div>
              )}
              <div>
                <h3 className="font-bold text-slate-800">{user.firstName}ga xabar</h3>
                <p className="text-xs text-slate-400">ID: {user.telegramId}</p>
              </div>
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl p-3.5 mb-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none" placeholder="Xabar yozing..." />
            <div className="flex gap-3">
              <button onClick={handleSendMessage} disabled={actionLoading || !msg.trim()} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm disabled:opacity-50">
                {actionLoading ? "Yuborilmoqda..." : "Yuborish"}
              </button>
              <button onClick={() => { setMsgModal(false); setMsg(""); }} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm">Bekor</button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Subscription Modal */}
      {giftModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Sovg{"'"}a obuna</h3>
                <p className="text-xs text-slate-400">{user.firstName} uchun bepul obuna berish</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {plans.filter((p: any) => p.isActive).map((p: any) => (
                <button key={p.id} onClick={() => setSelectedPlanId(p.id)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${selectedPlanId === p.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.duration} kun</p>
                  </div>
                  <p className="text-sm font-bold text-indigo-600">{fmt(p.price)}</p>
                </button>
              ))}
              {plans.filter((p: any) => p.isActive).length === 0 && (
                <p className="text-center text-sm text-slate-400 py-4">Aktiv rejalar yo{"'"}q</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleGiftSub} disabled={actionLoading || !selectedPlanId} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm disabled:opacity-50">
                {actionLoading ? "Berilmoqda..." : "Obuna berish"}
              </button>
              <button onClick={() => { setGiftModal(false); setSelectedPlanId(null); }} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
