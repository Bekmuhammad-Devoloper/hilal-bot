"use client";"use client";

import { useEffect, useState } from "react";import { useEffect, useState } from "react";

import Link from "next/link";import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";import { usePathname, useRouter } from "next/navigation";

import { getMe } from "@/lib/api";import { getMe } from "@/lib/api";



const menu = [const menu = [

  { href: "/dashboard", icon: "📊", label: "Dashboard" },  { href: "/dashboard", icon: "📊", label: "Dashboard" },

  { href: "/dashboard/users", icon: "👥", label: "Foydalanuvchilar" },  { href: "/dashboard/users", icon: "👥", label: "Foydalanuvchilar" },

  { href: "/dashboard/subscriptions", icon: "💎", label: "Obunalar" },  { href: "/dashboard/subscriptions", icon: "💎", label: "Obunalar" },

  { href: "/dashboard/payments", icon: "💳", label: "To'lovlar" },  { href: "/dashboard/payments", icon: "💳", label: "To'lovlar" },

  { href: "/dashboard/plans", icon: "📋", label: "Tariflar" },  { href: "/dashboard/plans", icon: "📋", label: "Tariflar" },

  { href: "/dashboard/broadcast", icon: "📢", label: "Xabar yuborish" },  { href: "/dashboard/broadcast", icon: "📢", label: "Xabar yuborish" },

  { href: "/dashboard/settings", icon: "⚙️", label: "Sozlamalar" },  { href: "/dashboard/settings", icon: "⚙️", label: "Sozlamalar" },

];];



export default function DashboardLayout({ children }: { children: React.ReactNode }) {export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();  const pathname = usePathname();

  const router = useRouter();  const router = useRouter();

  const [open, setOpen] = useState(true);  const [open, setOpen] = useState(true);

  const [mobileOpen, setMobileOpen] = useState(false);  const [user, setUser] = useState<any>(null);

  const [user, setUser] = useState<any>(null);  const [loading, setLoading] = useState(true);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

  useEffect(() => {    const token = localStorage.getItem("token");

    const token = localStorage.getItem("token");    if (!token) { router.push("/"); return; }

    if (!token) { router.push("/"); return; }    getMe()

    getMe()      .then((u) => {

      .then((u) => {        if (!u?.isAdmin) { localStorage.clear(); router.push("/"); return; }

        if (!u?.isAdmin) { localStorage.clear(); router.push("/"); return; }        setUser(u);

        setUser(u);      })

      })      .catch(() => { localStorage.clear(); router.push("/"); })

      .catch(() => { localStorage.clear(); router.push("/"); })      .finally(() => setLoading(false));

      .finally(() => setLoading(false));  }, []);

  }, []);

  if (loading) return (

  if (loading) return (    <div className="min-h-screen flex items-center justify-center bg-gray-50">

    <div className="min-h-screen flex items-center justify-center bg-gray-50">      <div className="text-4xl animate-pulse">⏳</div>

      <div className="relative w-20 h-20">    </div>

        <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 border-t-indigo-900 logo-ring-spin" />  );

        <img src="/logo.jpg" alt="Hilal Bot" className="w-16 h-16 rounded-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      </div>  return (

    </div>    <div className="min-h-screen flex bg-gray-100">

  );      <aside className={`${open ? "w-64" : "w-20"} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-30`}>

        <div className="p-4 border-b flex items-center gap-3">

  const Sidebar = ({ mobile = false }) => (          <span className="text-2xl">🇹🇷</span>

    <aside className={`${mobile ? "w-72" : open ? "w-64" : "w-20"} bg-white border-r flex flex-col h-full transition-all duration-300`}>          {open && <div><h2 className="font-bold text-gray-800">Oson Turk Tili</h2><p className="text-xs text-gray-400">Admin Panel</p></div>}

      {/* Header */}        </div>

      <div className="p-4 border-b flex items-center gap-3">        <nav className="flex-1 p-3">

        <img src="/logo.jpg" alt="Hilal Bot" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />          {menu.map((m) => (

        {(open || mobile) && (            <Link key={m.href} href={m.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${pathname === m.href ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>

          <div>              <span className="text-xl">{m.icon}</span>

            <h2 className="font-bold text-gray-900 text-sm">Hilal Bot</h2>              {open && <span>{m.label}</span>}

            <p className="text-xs text-gray-400">Admin Panel</p>            </Link>

          </div>          ))}

        )}        </nav>

      </div>        <div className="p-3 border-t">

          {open && user && (

      {/* Navigation */}            <div className="flex items-center gap-2 px-4 py-2 mb-2">

      <nav className="flex-1 p-3 space-y-1">              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm font-bold">{user.firstName?.charAt(0) || "A"}</div>

        {menu.map((m) => {              <div><p className="text-sm font-medium text-gray-800">{user.firstName}</p><p className="text-xs text-gray-400">ID: {user.telegramId}</p></div>

          const active = pathname === m.href;            </div>

          return (          )}

            <Link          <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg">

              key={m.href}            <span>{open ? "◀" : "▶"}</span>{open && <span className="text-sm">Yopish</span>}

              href={m.href}          </button>

              onClick={() => mobile && setMobileOpen(false)}          <button onClick={() => { localStorage.clear(); router.push("/"); }} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg mt-1">

              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${            <span>🚪</span>{open && <span className="text-sm">Chiqish</span>}

                active          </button>

                  ? "bg-indigo-900 text-white font-medium shadow-sm"        </div>

                  : "text-gray-600 hover:bg-gray-50"      </aside>

              }`}      <main className={`flex-1 ${open ? "ml-64" : "ml-20"} transition-all duration-300`}>

            >        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">

              <span className="text-lg">{m.icon}</span>          <div className="text-sm text-gray-500">{menu.find((m) => m.href === pathname)?.icon} {menu.find((m) => m.href === pathname)?.label || "Dashboard"}</div>

              {(open || mobile) && <span>{m.label}</span>}          <div className="text-sm text-gray-500">👋 {user?.firstName}</div>

            </Link>        </header>

          );        <div className="p-6">{children}</div>

        })}      </main>

      </nav>    </div>

  );

      {/* User & Actions */}}

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
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed h-full z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <main className={`flex-1 ${open ? "md:ml-64" : "md:ml-20"} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b px-5 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-gray-900">{currentPage?.icon} {currentPage?.label || "Dashboard"}</h1>
            </div>
          </div>
          <div className="text-sm text-gray-400">👋 {user?.firstName}</div>
        </header>

        {/* Content */}
        <div className="p-5">{children}</div>
      </main>
    </div>
  );
}
