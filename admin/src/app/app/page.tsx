"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

function MiniAppInner() {
  const searchParams = useSearchParams();
  const paramUser = searchParams.get("user");

  const [userId, setUserId] = useState<string | null>(paramUser);
  const [screen, setScreen] = useState<"splash" | "welcome" | "subscribe" | "payment" | "success" | "manage" | "payments_history" | "edit_profile" | "terms" | "faq" | "contact">("splash");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"payme" | "click">("click");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [tgPhotoUrl, setTgPhotoUrl] = useState<string | null>(null);
  const [tgUsername, setTgUsername] = useState<string | null>(null);
  const [prevScreen, setPrevScreen] = useState<string>("manage");

  // Telegram WebApp init + userId olish
  useEffect(() => {
    let uid = paramUser;
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();

        // 1. URL paramdan olish
        // 2. initDataUnsafe dan olish
        // 3. initData string parse qilish
        if (!uid) {
          const tgUser = tg.initDataUnsafe?.user;
          if (tgUser?.id) uid = String(tgUser.id);
        }
        if (!uid && tg.initData) {
          try {
            const params = new URLSearchParams(tg.initData);
            const userStr = params.get("user");
            if (userStr) {
              const parsed = JSON.parse(userStr);
              if (parsed?.id) uid = String(parsed.id);
            }
          } catch (e) {}
        }

        // Telegram profil rasmi va username olish
        const tgUser = tg.initDataUnsafe?.user;
        if (tgUser?.photo_url) setTgPhotoUrl(tgUser.photo_url);
        if (tgUser?.username) setTgUsername(tgUser.username);
      }
    } catch (e) {}
    if (uid) setUserId(uid);

    // Splash ko'rsatib, parallel data yuklash
    if (uid) {
      const splashMin = new Promise(r => setTimeout(r, 1500));
      const dataLoad = fetchDataSilent(uid);
      // Maksimum 10 soniya kutish, keyin welcome sahifaga o'tish
      const maxWait = new Promise<string>(r => setTimeout(() => r("welcome"), 10000));
      Promise.all([splashMin, Promise.race([dataLoad, maxWait])]).then(([, result]) => {
        if (result === "manage") setScreen("manage");
        else setScreen("welcome");
      }).catch(() => setScreen("welcome"));
    } else {
      setTimeout(() => setScreen("welcome"), 1500);
    }
  }, [paramUser]);

  const fetchDataSilent = async (uid: string): Promise<string> => {
    try {
      const safeFetch = async (url: string) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        try {
          const r = await fetch(url, { signal: controller.signal });
          const text = await r.text();
          clearTimeout(timer);
          if (!text) return null;
          try { return JSON.parse(text); } catch { return null; }
        } catch {
          clearTimeout(timer);
          return null;
        }
      };
      const [plansRes, subRes, paymentsRes, profileRes] = await Promise.all([
        safeFetch(API + "/plans"),
        safeFetch(API + "/subscriptions/active/" + uid),
        safeFetch(API + "/payments/user/" + uid),
        safeFetch(API + "/users/telegram/" + uid),
      ]);
      setPlans(plansRes || []);
      setPayments(paymentsRes || []);
      if (profileRes) {
        setUserProfile(profileRes);
        setEditName(((profileRes.firstName || "") + " " + (profileRes.lastName || "")).trim());
        setEditPhone(profileRes.phone || "");
      }
      // Admin yoki aktiv obuna — manage ekraniga
      if (profileRes?.isAdmin) {
        if (subRes && subRes.id && subRes.endDate && !isNaN(new Date(subRes.endDate).getTime())) {
          setSubscription(subRes);
        }
        return "manage";
      }
      if (subRes && subRes.id && subRes.endDate && !isNaN(new Date(subRes.endDate).getTime())) {
        setSubscription(subRes);
        return "manage";
      }
      return "welcome";
    } catch (e) {
      return "welcome";
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setScreen("payment");
  };

  const handlePayment = async () => {
    if (!selectedPlan || !userId) return;
    if (paymentMethod === "click" && (!cardNumber || !cardExpiry)) return;
    setProcessing(true);
    try {
      const paymentRes = await fetch(API + "/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: parseInt(userId), planId: selectedPlan.id, method: paymentMethod }),
      }).then(r => r.json());

      await new Promise(r => setTimeout(r, 2000));

      const last4 = cardNumber.replace(/\s/g, "").slice(-4) || "0001";
      const result = await fetch(API + "/payments/confirm/" + paymentRes.id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardLast4: last4 }),
      }).then(r => r.json());

      setPaymentResult(result);
      setSubscription(result.subscription);
      setScreen("success");

      try {
        if ((window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.sendData(JSON.stringify({
            action: "payment_success",
            planId: selectedPlan.id,
            cardLast4: last4,
          }));
        }
      } catch (e) {}
    } catch (e) {
      alert("To'lovda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!userId) return;
    if (!confirm("Obunani bekor qilmoqchimisiz?")) return;
    try {
      await fetch(API + "/subscriptions/cancel/" + userId, { method: "POST" });
      try {
        if ((window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.sendData(JSON.stringify({
            action: "subscription_cancelled",
            endDate: subscription?.endDate,
          }));
        }
      } catch (e) {}
      setSubscription(null);
      setScreen("subscribe");
      if (userId) {
        const result = await fetchDataSilent(userId);
        setScreen(result === "manage" ? "manage" : "subscribe");
      }
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);
  const formatDate = (d: string) => {
    if (!d) return "—";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return dd + "." + mm + "." + yyyy;
  };

  const daysLeft = subscription && subscription.status === "active" && subscription.endDate
    ? (() => {
        const endTime = new Date(subscription.endDate).getTime();
        return isNaN(endTime) ? 0 : Math.max(0, Math.ceil((endTime - Date.now()) / 86400000));
      })()
    : 0;

  // ========== SPLASH ==========
  if (screen === "splash") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] flex items-center justify-center">
        <div className="flex flex-col items-center fade-in-up">
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            <div
              className="absolute rounded-full border-[3px] border-indigo-800/40 border-t-indigo-400 logo-ring-spin"
              style={{ width: 120, height: 120 }}
            />
            <img
              src="/logo.jpg"
              alt="Hilal Bot"
              className="rounded-full object-cover logo-pulse shadow-lg shadow-indigo-900/50"
              style={{ width: 96, height: 96 }}
            />
          </div>
          <h2 className="text-xl font-bold text-white mt-5 mb-1">Hilal Bot</h2>
          <p className="text-sm text-indigo-300/60">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ========== WELCOME — Kanal taqdimoti ==========
  if (screen === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] flex flex-col">
        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
          {/* Logo */}
          <div className="relative mb-6 scale-in">
            <div className="absolute -inset-3 bg-indigo-500/20 rounded-full blur-xl" />
            <img
              src="/logo.jpg"
              alt="Hilal Bot"
              className="relative w-28 h-28 rounded-full object-cover border-4 border-white/10 shadow-2xl shadow-indigo-900/50"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-white text-center mb-2 fade-in-up">
            Hilal Edu ga xush kelibsiz!
          </h1>
          <p className="text-sm text-indigo-300/60 text-center mb-8 fade-in-up" style={{ animationDelay: "0.1s" }}>
            Turk tilini oson va samarali o{"'"}rganing
          </p>

          {/* Features */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/[0.06] fade-in-up" style={{ animationDelay: "0.15s" }}>
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">📚</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Eksklyuziv darslar</p>
                <p className="text-xs text-indigo-300/50">Haftada 2 ta yangi dars</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/[0.06] fade-in-up" style={{ animationDelay: "0.25s" }}>
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🎥</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Video va matnlar</p>
                <p className="text-xs text-indigo-300/50">Savol-javoblar bilan</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/[0.06] fade-in-up" style={{ animationDelay: "0.35s" }}>
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-lg">🤝</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Turk tili muhiti</p>
                <p className="text-xs text-indigo-300/50">Fikrlash va muloqot imkoniyati</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="px-6 pb-10 fade-in-up" style={{ animationDelay: "0.45s" }}>
          <button
            onClick={() => setScreen("subscribe")}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform"
          >
            BOSHLASH
          </button>
          <p className="text-center text-xs text-indigo-300/30 mt-3">
            G{"'"}ulomjon Sobirov pullik boti
          </p>
        </div>
      </div>
    );
  }

  // ========== MANAGE — Animatsiyali minimalistik ==========
  if (screen === "manage") {
    const isAdmin = userProfile?.isAdmin;
    const hasSub = subscription && subscription.id;
    const totalDays = subscription?.plan?.duration || 30;
    const progressPercent = hasSub ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a]">
        {/* Hero card */}
        <div className="px-5 pt-8 pb-4 scale-in">
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-3xl p-6 text-white border border-white/[0.08] relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-indigo-500/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.jpg" alt="" className="w-10 h-10 rounded-full border-2 border-white/20" />
                <div>
                  <p className="font-bold text-base text-white">{subscription?.plan?.name || "Oson Turk Tili"}</p>
                  <p className="text-indigo-300/70 text-xs">{isAdmin && !hasSub ? "👑 Admin" : "Faol obuna"}</p>
                </div>
              </div>

              {hasSub ? (
                <>
                  <div className="mt-2">
                    <p className="text-indigo-300/70 text-xs mb-1">Obuna tugashiga</p>
                    <p className="text-5xl font-black count-pulse text-white">{daysLeft} <span className="text-lg font-medium text-indigo-300/70">kun</span></p>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-cyan-300 h-1.5 rounded-full progress-fill" style={{ width: progressPercent + "%" }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <p className="text-[10px] text-indigo-300/50">Boshlangan</p>
                      <p className="text-[10px] text-indigo-300/50">{daysLeft}/{totalDays} kun</p>
                    </div>
                  </div>
                </>
              ) : isAdmin ? (
                <div className="mt-2">
                  <p className="text-indigo-300/70 text-xs mb-1">Cheksiz kirish</p>
                  <p className="text-3xl font-black text-white">♾️ <span className="text-lg font-medium text-indigo-300/70">Admin rejim</span></p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-indigo-300/70 text-xs mb-1">Obuna tugashiga</p>
                  <p className="text-5xl font-black count-pulse text-white">0 <span className="text-lg font-medium text-indigo-300/70">kun</span></p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 space-y-3 pb-8">
          {/* Obunani yangilash */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08] fade-in-up stagger-1">
            <p className="font-semibold text-white text-center mb-4">{isAdmin && !hasSub ? "Obuna sotib olasizmi?" : "Obunani yangilaysizmi?"}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setScreen("subscribe"); setSubscription(null); }}
                className="py-3.5 bg-indigo-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
              >
                Ha
              </button>
              <button
                onClick={handleCancel}
                className="py-3.5 bg-white/[0.08] text-indigo-200 rounded-xl font-semibold text-sm border border-white/[0.1] active:scale-95 transition-transform"
              >
                Yo{"'"}q
              </button>
            </div>
          </div>

          {/* Menyular 1 */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden fade-in-up stagger-2">
            <button
              onClick={async () => {
                try {
                  const u = await fetch(API + "/users/telegram/" + userId).then(r => r.json());
                  setUserProfile(u);
                  setEditName((u.firstName || "") + (u.lastName ? " " + u.lastName : ""));
                  setEditPhone(u.phone || "");
                } catch {}
                setScreen("edit_profile");
              }}
              className="w-full px-5 py-4 flex items-center justify-between border-b border-white/[0.06] active:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center float-icon">
                  <svg className="w-[18px] h-[18px] text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>
                <span className="font-medium text-indigo-100 text-sm">Ma{"'"}lumotlarni o{"'"}zgartirish</span>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={() => setScreen("payments_history")}
              className="w-full px-5 py-4 flex items-center justify-between active:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center float-icon" style={{ animationDelay: "0.5s" }}>
                  <svg className="w-[18px] h-[18px] text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <span className="font-medium text-indigo-100 text-sm">To{"'"}lovlar tarixi</span>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Menyular 2 */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden fade-in-up stagger-3">
            <button onClick={() => setScreen("terms")} className="w-full px-5 py-4 flex items-center justify-between border-b border-white/[0.06] active:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center float-icon" style={{ animationDelay: "1s" }}>
                  <svg className="w-[18px] h-[18px] text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="font-medium text-indigo-100 text-sm">Ommaviy oferta</span>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => setScreen("faq")} className="w-full px-5 py-4 flex items-center justify-between border-b border-white/[0.06] active:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-rose-500/15 rounded-xl flex items-center justify-center float-icon" style={{ animationDelay: "1.5s" }}>
                  <svg className="w-[18px] h-[18px] text-rose-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" /></svg>
                </div>
                <span className="font-medium text-indigo-100 text-sm">FAQ</span>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button onClick={() => setScreen("contact")} className="w-full px-5 py-4 flex items-center justify-between active:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-sky-500/15 rounded-xl flex items-center justify-center float-icon" style={{ animationDelay: "2s" }}>
                  <svg className="w-[18px] h-[18px] text-sky-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <span className="font-medium text-indigo-100 text-sm">Aloqa</span>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== PAYMENTS HISTORY ==========
  if (screen === "payments_history") {
    const statusLabel = (s: string) => {
      if (s === "completed") return { text: "Tasdiqlangan", cls: "bg-emerald-500/15 text-emerald-400" };
      if (s === "pending") return { text: "Kutilmoqda", cls: "bg-amber-500/15 text-amber-400" };
      if (s === "failed") return { text: "Xato", cls: "bg-red-500/15 text-red-400" };
      if (s === "cancelled") return { text: "Bekor", cls: "bg-gray-500/15 text-gray-400" };
      return { text: s, cls: "bg-gray-500/15 text-gray-400" };
    };
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5">
        <div className="mb-6 scale-in">
          <button onClick={() => setScreen("manage")} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">To{"'"}lovlar tarixi</h1>
          <p className="text-sm text-indigo-300/50 mt-1">{payments.length} ta to{"'"}lov</p>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-16 fade-in-up">
            <div className="w-16 h-16 bg-white/[0.07] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-300/30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <p className="text-indigo-300/40 text-sm">To{"'"}lovlar mavjud emas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p: any, i: number) => {
              const st = statusLabel(p.status);
              return (
                <div key={p.id} className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08] fade-in-up">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                        <img src={p.method === "payme" ? "/payme-01.png" : "/click-01.png"} alt={p.method} className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{p.method === "payme" ? "Payme" : "Click"}</p>
                        <p className="text-indigo-300/40 text-[10px]">{formatDate(p.createdAt)}</p>
                      </div>
                    </div>
                    <span className={"text-[11px] font-medium px-2.5 py-1 rounded-lg " + st.cls}>{st.text}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-indigo-300/50 text-xs">{p.plan?.name || "Reja"}</p>
                    <p className="text-white font-bold text-base">{formatPrice(p.amount)} <span className="text-indigo-300/40 text-xs font-normal">so{"'"}m</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ========== EDIT PROFILE ==========
  if (screen === "edit_profile") {
    const handleSaveProfile = async () => {
      if (!userId) return;
      setSaving(true);
      try {
        const parts = editName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";
        await fetch(API + "/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telegramId: parseInt(userId),
            username: userProfile?.username || "",
            firstName,
            lastName,
          }),
        });
        alert("Ma'lumotlar saqlandi!");
        setScreen("manage");
      } catch {
        alert("Xatolik yuz berdi");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5 flex flex-col">
        <div className="mb-6 scale-in">
          <button onClick={() => setScreen("manage")} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">Ma{"'"}lumotlarni o{"'"}zgartirish</h1>
          <p className="text-sm text-indigo-300/50 mt-1">Shaxsiy ma{"'"}lumotlar</p>
        </div>

        <div className="space-y-4 fade-in-up stagger-1">
          {/* Avatar — TG profil rasmi */}
          <div className="flex justify-center mb-2">
            <div className="relative w-20 h-20">
              {userId && (
                <img
                  src={tgPhotoUrl || userProfile?.photoUrl || (API + "/users/photo/" + userId)}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-[3px] border-indigo-500/40 shadow-lg shadow-indigo-900/30 absolute inset-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold border-[3px] border-indigo-500/40">
                {(editName || "?")[0]?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* TG username */}
          {(tgUsername || userProfile?.username) && (
            <div className="text-center -mt-1 mb-2">
              <span className="text-indigo-300/60 text-sm">@{tgUsername || userProfile?.username}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-indigo-300/50 uppercase tracking-wider mb-1.5 block">Ism Familiya</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ismingiz"
              className="w-full px-4 py-3.5 bg-white/[0.07] border border-white/[0.1] rounded-2xl text-base font-medium focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-indigo-300/30 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-indigo-300/50 uppercase tracking-wider mb-1.5 block">Telefon raqam</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-3.5 bg-white/[0.07] border border-white/[0.1] rounded-2xl text-base font-medium focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-indigo-300/30 transition-all"
            />
          </div>

          {(userProfile || tgUsername) && (
            <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.06]">
              {userProfile?.telegramId && (
                <div className="flex items-center gap-2 text-indigo-300/40 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Telegram ID: {userProfile.telegramId}</span>
                </div>
              )}
              {(tgUsername || userProfile?.username) && (
                <div className="flex items-center gap-2 text-indigo-300/40 text-xs mt-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>@{tgUsername || userProfile?.username}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 fade-in-up stagger-2">
          <button
            onClick={handleSaveProfile}
            disabled={saving || !editName.trim()}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full logo-ring-spin" />
                Saqlanmoqda...
              </span>
            ) : "Saqlash"}
          </button>
        </div>
      </div>
    );
  }

  // ========== TERMS (Ommaviy oferta) ==========
  if (screen === "terms") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5 pb-10">
        <div className="mb-6 scale-in">
          <button onClick={() => { setScreen(prevScreen as any); setPrevScreen("manage"); }} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">Ommaviy oferta</h1>
          <p className="text-sm text-indigo-300/50 mt-1">Xizmat ko{"'"}rsatish shartlari</p>
        </div>

        <div className="space-y-4 fade-in-up">
          {[
            { icon: "💳", title: "1. Obuna narxi va to'lov", text: "Kanalga kirish oylik obuna asosida ishlaydi. To'lov har 30 kunda avtomatik ravishda yechib olinadi. To'lov Payme yoki Click orqali amalga oshiriladi." },
            { icon: "🔄", title: "2. Avtomatik yechib olish", text: "Har oy belgilangan summa avtomatik ravishda kartangizdan yechib olinadi. Obuna faol bo'lgan davr mobaynida to'lov avtomatik davom etadi." },
            { icon: "❌", title: "3. Bekor qilish tartibi", text: "Obunani istalgan vaqtda bekor qilish mumkin. Bekor qilish keyingi to'lov davridan kuchga kiradi. Joriy davr oxirigacha kanaldan foydalanish mumkin." },
            { icon: "💰", title: "4. Pulni qaytarish", text: "Foydalanilgan davr uchun to'lov qaytarilmaydi. Obuna bekor qilinsa, joriy oylik davr tugaguncha xizmatdan foydalanishingiz mumkin." },
            { icon: "🔐", title: "5. Kanal kontenti", text: "Kanaldagi barcha materiallar mualliflik huquqi bilan himoyalangan. Kontentni uchinchi shaxslarga tarqatish, nusxalash yoki qayta nashr qilish qat'iyan taqiqlanadi." },
            { icon: "⚠️", title: "6. Qoidabuzarlik", text: "Shartlarni buzgan foydalanuvchilarning obunasi ogohlantirishsiz bekor qilinishi mumkin. Bunday hollarda to'lov qaytarilmaydi." },
            { icon: "📢", title: "7. O'zgarishlar", text: "Ma'muriyat istalgan vaqtda ushbu shartlarni yangilash huquqiga ega. O'zgarishlar haqida foydalanuvchilarga oldindan xabar beriladi." },
            { icon: "📞", title: "8. Aloqa", text: "Savollar yoki muammolar bo'lsa, biz bilan bog'laning. Biz sizga yordam berishdan mamnunmiz." },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-4 border border-white/[0.08]">
              <h3 className="text-white font-semibold text-sm mb-2">{item.icon} {item.title}</h3>
              <p className="text-indigo-300/50 text-xs leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Aloqa bo'limi */}
        <div className="mt-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-5 border border-indigo-400/15 fade-in-up">
          <h3 className="text-white font-bold text-sm mb-4 text-center">Bog{"'"}lanish uchun</h3>
          <div className="space-y-3">
            <a
              href="https://t.me/hilaledu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] active:bg-white/[0.12] transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <span className="text-lg">✈️</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Telegram</p>
                <p className="text-indigo-300/50 text-xs">@hilaledu</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </a>
            <a
              href="tel:+99855519787878"
              className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] active:bg-white/[0.12] transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <span className="text-lg">📱</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Telefon raqam</p>
                <p className="text-indigo-300/50 text-xs">55-519-78-78</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-indigo-300/30 text-[10px]">Obunani rasmiylashtirish orqali siz ushbu shartlarga rozilik bildirasiz</p>
        </div>
      </div>
    );
  }

  // ========== FAQ ==========
  if (screen === "faq") {
    const faqItems = [
      { q: "Obuna qanday ishlaydi?", a: "Reja tanlang, to'lovni amalga oshiring va kanal havolasini oling. Obuna muddati davomida barcha kontentlarga kirish mumkin." },
      { q: "To'lovni qanday amalga oshiraman?", a: "Payme yoki Click orqali to'lov qilishingiz mumkin. Karta raqamingizni kiritib, to'lovni tasdiqlang." },
      { q: "Obunani bekor qilsam bo'ladimi?", a: "Ha, istalgan vaqtda obunani bekor qilish mumkin. Bosh sahifadagi 'Obunani yangilaysizmi?' bo'limida 'Yo'q' tugmasini bosing." },
      { q: "Kanalga qanday kiramman?", a: "To'lov muvaffaqiyatli bo'lgandan so'ng, kanal havolasi bot orqali xabar sifatida yuboriladi." },
      { q: "Obuna muddati tugasa nima bo'ladi?", a: "Obuna muddati tugagach, kanalga kirish avtomatik cheklanadi. Qayta obuna bo'lishingiz mumkin." },
      { q: "Kartam qabul qilinmayapti, nima qilsam bo'ladi?", a: "Payme yoki Click ilovasini o'rnating, kartangizni ro'yxatdan o'tkazing va qaytadan urinib ko'ring." },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5">
        <div className="mb-6 scale-in">
          <button onClick={() => setScreen("manage")} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">FAQ</h1>
          <p className="text-sm text-indigo-300/50 mt-1">Ko{"'"}p beriladigan savollar</p>
        </div>

        <div className="space-y-3 fade-in-up">
          {faqItems.map((item, i) => (
            <button
              key={i}
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              className="w-full text-left bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.08] overflow-hidden transition-all"
            >
              <div className="px-4 py-4 flex items-center justify-between">
                <span className="text-white text-sm font-medium pr-3">{item.q}</span>
                <svg className={"w-4 h-4 text-indigo-300/40 flex-shrink-0 transition-transform duration-300 " + (faqOpen === i ? "rotate-180" : "")} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
              {faqOpen === i && (
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px bg-white/[0.06] mb-3" />
                  <p className="text-indigo-300/50 text-xs leading-relaxed">{item.a}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ========== CONTACT (Aloqa) ==========
  if (screen === "contact") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5">
        <div className="mb-6 scale-in">
          <button onClick={() => setScreen("manage")} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">Aloqa</h1>
          <p className="text-sm text-indigo-300/50 mt-1">Biz bilan bog{"'"}laning</p>
        </div>

        <div className="space-y-4 fade-in-up">
          {/* Admin kontakt */}
          <a
            href="https://t.me/hilal_admin"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08] active:bg-white/[0.1] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-500/15 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Telegram Admin</p>
                <p className="text-indigo-300/50 text-xs mt-0.5">@hilal_admin</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </div>
          </a>

          {/* Kanal */}
          <a
            href="https://t.me/hilal_bot_channel"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08] active:bg-white/[0.1] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/15 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Rasmiy kanal</p>
                <p className="text-indigo-300/50 text-xs mt-0.5">@hilal_bot_channel</p>
              </div>
              <svg className="w-4 h-4 text-indigo-400/30 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </div>
          </a>

          {/* Email */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/15 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Email</p>
                <p className="text-indigo-300/50 text-xs mt-0.5">support@hilalbot.uz</p>
              </div>
            </div>
          </div>

          {/* Ish vaqti */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/15 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Ish vaqti</p>
                <p className="text-indigo-300/50 text-xs mt-0.5">Dushanba - Shanba, 9:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== SUBSCRIBE — reja tanlash ==========
  if (screen === "subscribe") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a]">
        {plans.map((plan, planIdx) => {
          const features = plan.features ? JSON.parse(plan.features) : [];
          return (
            <div key={plan.id} className="px-5 pt-6 pb-8">
              {/* Narx */}
              <div className="mb-5 scale-in">
                <p className="text-xs font-medium text-indigo-300/50 tracking-wider uppercase mb-1">Obuna narxi</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-white">{formatPrice(plan.price)}</span>
                  <span className="text-lg font-semibold text-indigo-300/50">UZS</span>
                </div>
              </div>

              {/* Feature card */}
              <div className="bg-white/[0.07] backdrop-blur-sm rounded-3xl p-6 border border-white/[0.08] mb-6 fade-in-up stagger-1">
                <h2 className="text-lg font-bold text-white mb-5">{plan.name}</h2>
                <div className="space-y-4">
                  {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 fade-in-up" style={{ animationDelay: (0.15 + i * 0.1) + "s" }}>
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-[15px] text-indigo-100/80 leading-snug pt-1">{f}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* To'lov turi */}
              <div className="mb-6 fade-in-up stagger-2">
                <p className="text-xs font-medium text-indigo-300/50 tracking-wider uppercase mb-3">To{"'"}lov turi</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("payme")}
                    className={"relative overflow-hidden rounded-2xl border-2 transition-all duration-300 active:scale-[0.96] " + (paymentMethod === "payme" ? "border-[#00CCCC] bg-gradient-to-br from-[#00CCCC]/20 to-[#009999]/10 shadow-lg shadow-[#00CCCC]/20" : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06]")}
                  >
                    {paymentMethod === "payme" && <div className="absolute inset-0 bg-gradient-to-br from-[#00CCCC]/10 to-transparent" />}
                    <div className="relative p-4 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-white shadow-md">
                        <img src="/payme-01.png" alt="Payme" className="w-12 h-12 object-contain" />
                      </div>
                      <p className={"text-sm font-bold transition-colors " + (paymentMethod === "payme" ? "text-[#00CCCC]" : "text-white")}>Payme</p>
                      <p className="text-[10px] text-indigo-300/40 mt-0.5">Payme orqali</p>
                    </div>
                    <div className={"absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 " + (paymentMethod === "payme" ? "border-[#00CCCC] bg-[#00CCCC] scale-100" : "border-white/20 scale-90")}>
                      {paymentMethod === "payme" && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("click")}
                    className={"relative overflow-hidden rounded-2xl border-2 transition-all duration-300 active:scale-[0.96] " + (paymentMethod === "click" ? "border-[#00B4FF] bg-gradient-to-br from-[#00B4FF]/20 to-[#0088CC]/10 shadow-lg shadow-[#00B4FF]/20" : "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.06]")}
                  >
                    {paymentMethod === "click" && <div className="absolute inset-0 bg-gradient-to-br from-[#00B4FF]/10 to-transparent" />}
                    <div className="relative p-4 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-white shadow-md">
                        <img src="/click-01.png" alt="Click" className="w-12 h-12 object-contain" />
                      </div>
                      <p className={"text-sm font-bold transition-colors " + (paymentMethod === "click" ? "text-[#00B4FF]" : "text-white")}>Click</p>
                      <p className="text-[10px] text-indigo-300/40 mt-0.5">Click orqali</p>
                    </div>
                    <div className={"absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 " + (paymentMethod === "click" ? "border-[#00B4FF] bg-[#00B4FF] scale-100" : "border-white/20 scale-90")}>
                      {paymentMethod === "click" && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                </div>
              </div>

              {/* Davom etish */}
              <div className="fade-in-up stagger-3">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform"
                >
                  Davom etish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== PAYMENT ==========
  if (screen === "payment") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] p-5 flex flex-col">
        {/* Header */}
        <div className="mb-6 scale-in">
          <button onClick={() => setScreen("subscribe")} className="flex items-center gap-1.5 text-indigo-300/50 text-sm mb-4 active:text-indigo-200 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Orqaga
          </button>
          <h1 className="text-2xl font-bold text-white">Karta ma{"'"}lumotlari</h1>
          <p className="text-sm text-indigo-300/50 mt-1">Xavfsiz to{"'"}lov</p>
        </div>

        {/* Card inputs */}
        <div className="space-y-3 mb-6 fade-in-up stagger-1">
          <div>
            <label className="text-xs font-medium text-indigo-300/50 uppercase tracking-wider mb-1.5 block">Karta raqami</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                setCardNumber(v.replace(/(\d{4})(?=\d)/g, "$1 "));
              }}
              placeholder="0000 0000 0000 0000"
              className="w-full px-4 py-3.5 bg-white/[0.07] border border-white/[0.1] rounded-2xl text-base font-medium focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-indigo-300/30 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-indigo-300/50 uppercase tracking-wider mb-1.5 block">Amal qilish muddati</label>
            <input
              type="text"
              value={cardExpiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                setCardExpiry(v);
              }}
              placeholder="MM/YY"
              className="w-full px-4 py-3.5 bg-white/[0.07] border border-white/[0.1] rounded-2xl text-base font-medium focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-white placeholder-indigo-300/30 transition-all"
            />
          </div>
        </div>

        {/* Help section */}
        <div className="bg-white/[0.07] rounded-2xl p-5 border border-white/[0.08] mb-6 fade-in-up stagger-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-amber-500/15 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="font-semibold text-white text-sm">Karta ulanmayaptimi?</p>
          </div>
          <div className="space-y-1.5 pl-[42px]">
            <p className="text-xs text-indigo-300/40">1. Payme yoki Click ilovasini o{"'"}rnating</p>
            <p className="text-xs text-indigo-300/40">2. Ilovada kartangizni qo{"'"}shing</p>
            <p className="text-xs text-indigo-300/40">3. Bu sahifada karta raqamini kiriting</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mb-4 fade-in-up stagger-3">
          <button
            onClick={() => { setPrevScreen("payment"); setScreen("terms"); }}
            className="text-indigo-400/60 text-xs underline underline-offset-2 mb-3 active:text-indigo-300 transition-colors"
          >
            📄 Ommaviy oferta shartlari
          </button>
          <div className="flex items-center justify-center gap-3 text-xs text-indigo-300/30">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>Xavfsiz to{"'"}lov</span>
            <img src="/payme-01.png" alt="Payme" className="h-5 opacity-40 object-contain" />
            <img src="/click-01.png" alt="Click" className="h-5 opacity-40 object-contain" />
          </div>
        </div>

        <div className="mt-auto fade-in-up stagger-3">
          <button
            onClick={handlePayment}
            disabled={processing || !cardNumber || !cardExpiry}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:shadow-none"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full logo-ring-spin" />
                To{"'"}lov amalga oshirilmoqda...
              </span>
            ) : "Kodni olish"}
          </button>
        </div>
      </div>
    );
  }

  // ========== SUCCESS ==========
  if (screen === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] flex flex-col items-center justify-center p-5">
        <div className="scale-in">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[28px] flex items-center justify-center mb-6 mx-auto shadow-xl shadow-emerald-900/20">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 fade-in-up stagger-1">Obuna tasdiqlandi!</h1>
        <p className="text-indigo-300/50 text-center text-sm leading-relaxed mb-8 fade-in-up stagger-2 max-w-[260px]">
          Kanalga havola botga xabar sifatida keladi. Botga o{"'"}ting va havolani bosing.
        </p>

        <div className="w-full mt-auto fade-in-up stagger-3">
          <button
            onClick={() => {
              try { if ((window as any).Telegram?.WebApp) (window as any).Telegram.WebApp.close(); } catch (e) {}
            }}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-900/30 active:scale-[0.98] transition-transform"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function MiniApp() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] flex items-center justify-center">
          <div className="flex flex-col items-center fade-in-up">
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <div
                className="absolute rounded-full border-[3px] border-indigo-800/40 border-t-indigo-400 logo-ring-spin"
                style={{ width: 120, height: 120 }}
              />
              <img
                src="/logo.jpg"
                alt="Hilal Bot"
                className="rounded-full object-cover logo-pulse shadow-lg shadow-indigo-900/50"
                style={{ width: 96, height: 96 }}
              />
            </div>
            <h2 className="text-xl font-bold text-white mt-5 mb-1">Hilal Bot</h2>
            <p className="text-sm text-indigo-300/60">Yuklanmoqda...</p>
          </div>
        </div>
      }
    >
      <MiniAppInner />
    </Suspense>
  );
}
