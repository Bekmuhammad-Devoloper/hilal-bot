const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, 'admin', 'src', 'app');

// page.tsx - Login page
fs.writeFileSync(path.join(base, 'page.tsx'), `"use client";
import { useState } from "react";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

export default function LoginPage() {
  const [telegramId, setTelegramId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(\`\${API}/auth/login-telegram\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: parseInt(telegramId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xatolik");
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Admin huquqi yo'q!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Hilal Bot" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-md" />
          <h1 className="text-2xl font-bold text-gray-900">Hilal Bot</h1>
          <p className="text-gray-400 mt-1">Admin Panel</p>
        </div>
        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
              {error}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">Telegram ID</label>
            <input
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-indigo-900 outline-none text-gray-800 text-lg"
              placeholder="Telegram ID kiriting"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-900 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-indigo-800 transition disabled:opacity-50"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          Botda /admin komandasini yozing — avtomatik kirasiz
        </p>
      </div>
    </div>
  );
}
`);
console.log('✅ page.tsx written');

// auth/page.tsx
fs.writeFileSync(path.join(base, 'auth', 'page.tsx'), `"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API = typeof window !== "undefined" && window.location.hostname === "localhost"
  ? "http://localhost:7777/api"
  : "/api";

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) { setStatus("error"); return; }
    fetch(\`\${API}/auth/login-code\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          setStatus("success");
          setTimeout(() => (window.location.href = "/dashboard"), 1000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-sm border">
        {status === "loading" && (
          <>
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />
              <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-500">Tekshirilmoqda...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-bold text-lg">Muvaffaqiyatli!</p>
            <p className="text-gray-400 text-sm mt-1">{"Yo'naltirilmoqda..."}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">❌</span>
            </div>
            <p className="text-red-600 font-bold text-lg mb-2">Kod yaroqsiz!</p>
            <p className="text-gray-400 text-sm mb-4">Botda /admin komandasini qayta yuboring</p>
            <a href="/" className="text-indigo-600 font-medium text-sm">← Bosh sahifaga</a>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />
          <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
`);
console.log('✅ auth/page.tsx written');

// dashboard/layout.tsx
fs.writeFileSync(path.join(base, 'dashboard', 'layout.tsx'), `"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

const menu = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/users", icon: "👥", label: "Foydalanuvchilar" },
  { href: "/dashboard/subscriptions", icon: "💎", label: "Obunalar" },
  { href: "/dashboard/payments", icon: "💳", label: "To\\'lovlar" },
  { href: "/dashboard/plans", icon: "📋", label: "Tariflar" },
  { href: "/dashboard/broadcast", icon: "📢", label: "Xabar yuborish" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Sozlamalar" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    getMe()
      .then((u) => {
        if (!u?.isAdmin) { localStorage.clear(); router.push("/"); return; }
        setUser(u);
      })
      .catch(() => { localStorage.clear(); router.push("/"); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />
        <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={\`\${mobile ? "w-72" : open ? "w-64" : "w-20"} bg-white border-r flex flex-col h-full transition-all duration-300\`}>
      <div className="p-4 border-b flex items-center gap-3">
        <img src="/logo.jpg" alt="Hilal Bot" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        {(open || mobile) && (
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Hilal Bot</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {menu.map((m) => {
          const active = pathname === m.href;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => mobile && setMobileOpen(false)}
              className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm \${
                active
                  ? "bg-indigo-900 text-white font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }\`}
            >
              <span className="text-lg">{m.icon}</span>
              {(open || mobile) && <span>{m.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t space-y-1">
        {(open || mobile) && user && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-900 text-sm font-bold flex-shrink-0">
              {user.firstName?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.firstName}</p>
              <p className="text-xs text-gray-400 truncate">ID: {user.telegramId}</p>
            </div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-gray-50 rounded-xl text-sm"
          >
            <span>{open ? "◀" : "▶"}</span>
            {open && <span>Yopish</span>}
          </button>
        )}
        <button
          onClick={() => { localStorage.clear(); router.push("/"); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm"
        >
          <span>🚪</span>
          {(open || mobile) && <span>Chiqish</span>}
        </button>
      </div>
    </aside>
  );

  const currentPage = menu.find((m) => m.href === pathname);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden md:flex fixed h-full z-30">
        <Sidebar />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72">
            <Sidebar mobile />
          </div>
        </div>
      )}
      <main className={\`flex-1 \${open ? "md:ml-64" : "md:ml-20"} transition-all duration-300\`}>
        <header className="bg-white border-b px-5 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-bold text-gray-900">{currentPage?.icon} {currentPage?.label || "Dashboard"}</h1>
          </div>
          <div className="text-sm text-gray-400">👋 {user?.firstName}</div>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}
`);
console.log('✅ dashboard/layout.tsx written');
console.log('✅ All files written successfully!');
