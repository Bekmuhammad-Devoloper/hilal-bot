"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:1001/api"
  : "/api";

function MiniAppInner() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");

  const [screen, setScreen] = useState<"loading" | "subscribe" | "payment" | "success" | "manage">("loading");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"uzcard" | "visa">("uzcard");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const [plansRes, subRes, paymentsRes] = await Promise.all([
        fetch(`${API}/plans`).then((r) => r.json()),
        fetch(`${API}/subscriptions/active/${userId}`).then((r) => r.json()).catch(() => null),
        fetch(`${API}/payments/user/${userId}`).then((r) => r.json()).catch(() => []),
      ]);
      setPlans(plansRes || []);
      setPayments(paymentsRes || []);
      if (subRes && subRes.id) {
        setSubscription(subRes);
        setScreen("manage");
      } else {
        setScreen("subscribe");
      }
    } catch (e) {
      setScreen("subscribe");
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setScreen("payment");
  };

  const handlePayment = async () => {
    if (!selectedPlan || !userId) return;
    if (paymentMethod === "uzcard" && (!cardNumber || !cardExpiry)) return;
    setProcessing(true);

    try {
      // To'lov yaratish
      const paymentRes = await fetch(`${API}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: parseInt(userId), planId: selectedPlan.id, method: paymentMethod }),
      }).then((r) => r.json());

      // Simulyatsiya — 2 soniya kutish (haqiqiy integratsiyada Click API ishlatiladi)
      await new Promise((r) => setTimeout(r, 2000));

      // To'lovni tasdiqlash
      const last4 = cardNumber.replace(/\s/g, "").slice(-4) || "0001";
      const result = await fetch(`${API}/payments/confirm/${paymentRes.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardLast4: last4 }),
      }).then((r) => r.json());

      setPaymentResult(result);
      setSubscription(result.subscription);
      setScreen("success");

      // WebApp data yuborish (botga)
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
      await fetch(`${API}/subscriptions/cancel/${userId}`, { method: "POST" });
      // WebApp data
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
      await loadData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);
  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
  };

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / 86400000))
    : 0;

  // =============================================
  // LOADING
  // =============================================
  if (screen === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center fade-in-up">
          {/* Logo with spinning ring */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            {/* Spinning ring around logo */}
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 logo-ring-spin" />
            {/* Logo */}
            <img
              src="/logo.jpg"
              alt="Hilal Bot"
              className="w-24 h-24 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 logo-pulse shadow-lg"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Hilal Bot</h2>
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // =============================================
  // SUBSCRIBE — reja tanlash (Parallel Muhit uslubida)
  // =============================================
  if (screen === "subscribe") {
    return (
      <div className="min-h-screen bg-gray-50">
        {plans.map((plan) => {
          const features = plan.features ? JSON.parse(plan.features) : [];
          return (
            <div key={plan.id} className="p-5">
              <div className="text-sm text-gray-400 mb-1">Obuna narxi</div>
              <div className="text-4xl font-bold text-gray-900 mb-5">
                {formatPrice(plan.price)} UZS
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border mb-5">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h2>
                <div className="space-y-4">
                  {features.map((f: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 w-7 h-7 bg-indigo-900 rounded-lg flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{f.split("—")[0] || f.split(" - ")[0] || f}</p>
                        {(f.includes("—") || f.includes(" - ")) && (
                          <p className="text-sm text-gray-500 mt-0.5">{f.split("—")[1] || f.split(" - ")[1]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* To'lov turi */}
              <div className="mb-5">
                <p className="text-sm text-gray-400 mb-3">To'lov turi</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("visa")}
                    className={`p-4 rounded-xl border-2 transition ${paymentMethod === "visa" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-red-500">MC</span>
                      <span className="text-xs font-bold text-blue-600">VISA</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 ${paymentMethod === "visa" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                        {paymentMethod === "visa" && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Chet-el kartasi</p>
                    <p className="text-xs text-gray-400">Tribute orqali</p>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("uzcard")}
                    className={`p-4 rounded-xl border-2 transition ${paymentMethod === "uzcard" ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-green-600">UZ</span>
                      <span className="text-xs font-bold text-yellow-500">HUMO</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 ${paymentMethod === "uzcard" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"}`}>
                        {paymentMethod === "uzcard" && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">UZCARD / Humo</p>
                    <p className="text-xs text-gray-400">Click to'lov tizimi orqali</p>
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-800 transition"
              >
                Davom etish
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // =============================================
  // PAYMENT — Karta ma'lumotlari
  // =============================================
  if (screen === "payment") {
    return (
      <div className="min-h-screen bg-gray-50 p-5 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Bank kartasi ma'lumotlarini kiriting</h1>

        <input
          type="text"
          value={cardNumber}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 16);
            setCardNumber(v.replace(/(\d{4})(?=\d)/g, "$1 "));
          }}
          placeholder="0000 0000 0000 0000"
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium mb-4 focus:border-indigo-600 outline-none text-gray-800"
        />

        <input
          type="text"
          value={cardExpiry}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, "").slice(0, 4);
            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
            setCardExpiry(v);
          }}
          placeholder="MM/YY"
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium mb-6 focus:border-indigo-600 outline-none text-gray-800"
        />

        <div className="text-center mb-6">
          <p className="font-semibold text-gray-700 mb-3">Karta ulanmayaptimi?</p>
          <p className="text-sm text-gray-400">1. Click ilovasini o'rnating</p>
          <p className="text-sm text-gray-400">2. Click Ilovasini ochib, kartangizni qo'shing</p>
          <p className="text-sm text-gray-400">3. Botimizning shu sahifasiga qaytib, karta ma'lumotlarini qayta kiriting</p>
          <p className="text-sm text-gray-500 mt-2 font-medium">Bo'ldi ⚡</p>
        </div>

        <div className="text-center text-sm text-gray-400 mb-4">
          Powered by <span className="font-bold text-blue-500">● click</span>
        </div>

        <div className="mt-auto">
          <button
            onClick={handlePayment}
            disabled={processing || !cardNumber || !cardExpiry}
            className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-semibold text-lg hover:bg-indigo-800 transition disabled:opacity-50"
          >
            {processing ? "To'lov amalga oshirilmoqda..." : "Kodni olish"}
          </button>

          <button
            onClick={() => setScreen("subscribe")}
            className="w-full py-3 text-gray-500 text-sm mt-2"
          >
            ← Orqaga
          </button>
        </div>
      </div>
    );
  }

  // =============================================
  // SUCCESS — Obuna tasdiqlandi
  // =============================================
  if (screen === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
        <div className="w-24 h-24 bg-indigo-900 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Obuna tasdiqlandi</h1>
        <p className="text-gray-500 text-center mb-8">
          Kanalga havola botga xabar sifatida keladi. Botga o'ting.
        </p>

        <div className="mt-auto w-full">
          <button
            onClick={() => {
              try {
                if ((window as any).Telegram?.WebApp) {
                  (window as any).Telegram.WebApp.close();
                }
              } catch (e) {}
            }}
            className="w-full py-4 bg-indigo-900 text-white rounded-2xl font-semibold text-lg"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // =============================================
  // MANAGE — Obuna boshqarish
  // =============================================
  if (screen === "manage") {
    const totalDays = subscription?.plan?.duration || 30;
    const progressPercent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">{subscription?.plan?.name || "Oson Turk Tili"}</h1>

        {/* Obuna tugashiga */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <p className="text-sm text-gray-400 mb-1">Obuna tugashiga</p>
          <p className="text-4xl font-bold text-gray-900 mb-3">{daysLeft} kun</p>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-indigo-900 h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Obunani yangilash */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <p className="font-semibold text-gray-900 text-center mb-3">Obunani yangilaysizmi?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setScreen("subscribe"); setSubscription(null); }}
              className="py-3 bg-indigo-900 text-white rounded-xl font-semibold"
            >
              Ha
            </button>
            <button
              onClick={handleCancel}
              className="py-3 bg-gray-100 text-gray-500 rounded-xl font-semibold"
            >
              Yo'q
            </button>
          </div>
        </div>

        {/* Menyular */}
        <div className="bg-white rounded-2xl shadow-sm border mb-4 overflow-hidden">
          <button className="w-full px-5 py-4 flex items-center justify-between border-b text-left">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">✏️</span>
              <span className="font-medium text-gray-800">Ma'lumotlarni o'zgartirish</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          <button
            onClick={() => setScreen("subscribe")}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500">💳</span>
              <span className="font-medium text-gray-800">To'lovlar tarixi</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <button className="w-full px-5 py-4 flex items-center justify-between border-b text-left">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">📄</span>
              <span className="font-medium text-gray-800">Shartnoma</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full px-5 py-4 flex items-center justify-between border-b text-left">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">❓</span>
              <span className="font-medium text-gray-800">FAQ</span>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          <button className="w-full px-5 py-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <span className="text-gray-500">💬</span>
              <span className="font-medium text-gray-800">Aloqa</span>
            </div>
            <span className="text-gray-400">›</span>
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
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
          <div className="text-center fade-in-up">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 border-t-indigo-600 logo-ring-spin" />
              <img
                src="/logo.jpg"
                alt="Hilal Bot"
                className="w-24 h-24 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 logo-pulse shadow-lg"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Hilal Bot</h2>
            <p className="text-sm text-gray-400">Yuklanmoqda...</p>
          </div>
        </div>
      }
    >
      <MiniAppInner />
    </Suspense>
  );
}
