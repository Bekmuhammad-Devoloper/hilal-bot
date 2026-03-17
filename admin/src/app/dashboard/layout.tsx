"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

const menu = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/dashboard/users", icon: "👥", label: "Foydalanuvchilar" },
  { href: "/dashboard/subscriptions", icon: "💎", label: "Obunalar" },
  { href: "/dashboard/payments", icon: "💳", label: "To'lovlar" },
  { href: "/dashboard/plans", icon: "📋", label: "Tariflar" },
  { href: "/dashboard/broadcast", icon: "📢", label: "Xabar yuborish" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Sozlamalar" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
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
      <div className="text-4xl animate-pulse">⏳</div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className={`${open ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-30`}>
        <div className="p-4 border-b flex items-center gap-3">
          <span className="text-2xl">🇹🇷</span>
          {open && <div><h2 className="font-bold text-gray-800">Oson Turk Tili</h2><p className="text-xs text-gray-400">Admin Panel</p></div>}
        </div>
        <nav className="flex-1 p-3">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${pathname === m.href ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className="text-xl">{m.icon}</span>
              {open && <span>{m.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          {open && user && (
            <div className="flex items-center gap-2 px-4 py-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{user.firstName?.charAt(0) || "A"}</div>
              <div><p className="text-sm font-medium text-gray-800">{user.firstName}</p><p className="text-xs text-gray-400">ID: {user.telegramId}</p></div>
            </div>
          )}
          <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg">
            <span>{open ? "◀" : "▶"}</span>{open && <span className="text-sm">Yopish</span>}
          </button>
          <button onClick={() => { localStorage.clear(); router.push("/"); }} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg mt-1">
            <span>🚪</span>{open && <span className="text-sm">Chiqish</span>}
          </button>
        </div>
      </aside>
      <main className={`flex-1 ${open ? "ml-64" : "ml-20"} transition-all duration-300`}>
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="text-sm text-gray-500">{menu.find((m) => m.href === pathname)?.icon} {menu.find((m) => m.href === pathname)?.label || "Dashboard"}</div>
          <div className="text-sm text-gray-500">👋 {user?.firstName}</div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
