"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getMe } from "@/lib/api";

const menu = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/users",
    label: "Foydalanuvchilar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/subscriptions",
    label: "Obunalar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/payments",
    label: "To'lovlar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/plans",
    label: "Tariflar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/broadcast",
    label: "Xabar yuborish",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Sozlamalar",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
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
    
    // Avval tokenni decode qilib, admin ekanini tekshirish
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") { localStorage.clear(); router.push("/"); return; }
    } catch {
      localStorage.clear(); router.push("/"); return;
    }

    getMe()
      .then((u) => {
        if (u && u.isAdmin) {
          setUser(u);
        } else if (u && !u.isAdmin) {
          localStorage.clear(); router.push("/");
        } else {
          // null qaytdi — tokendan user data olish
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({ firstName: payload.firstName, telegramId: payload.telegramId, isAdmin: true, photoUrl: payload.photoUrl || null });
          } catch {
            localStorage.clear(); router.push("/");
          }
        }
      })
      .catch(() => {
        // Network xato — tokendan user data olish
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser({ firstName: payload.firstName, telegramId: payload.telegramId, isAdmin: true, photoUrl: payload.photoUrl || null });
        } catch {
          localStorage.clear(); router.push("/");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-5">
        <img src="/logo.png" alt="Hilal Bot" className="w-20 h-20 rounded-2xl object-cover shadow-lg logo-pulse" />
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Hilal Bot</h2>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">Admin Panel yuklanmoqda...</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`${mobile ? "w-[280px]" : open ? "w-[260px]" : "w-[76px]"} bg-white flex flex-col h-full transition-all duration-300 border-r border-slate-100`}>
      <div className="px-5 py-5 flex items-center gap-3">
        <img src="/logo.png" alt="Hilal Bot" className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md" />
        {(open || mobile) && (
          <div className="overflow-hidden">
            <h2 className="font-bold text-slate-900 text-[15px] leading-tight">Hilal Bot</h2>
            <p className="text-[11px] text-slate-400 font-medium">Admin Panel</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 mt-2">
        <p className={`text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2 ${open || mobile ? "px-3" : "px-1 text-center"}`}>
          {(open || mobile) ? "Menu" : "•"}
        </p>
        <div className="space-y-0.5">
          {menu.map((m) => {
            const active = pathname === m.href;
            return (
              <Link key={m.href} href={m.href} onClick={() => mobile && setMobileOpen(false)}
                title={!open && !mobile ? m.label : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium ${
                  active ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className={`flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>{m.icon}</span>
                {(open || mobile) && <span>{m.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="p-3 border-t border-slate-100">
        {(open || mobile) && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                {user.firstName?.charAt(0)?.toUpperCase() || "A"}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-[13px] font-semibold text-slate-700 truncate">{user.firstName}</p>
              <p className="text-[11px] text-slate-400 truncate">ID: {user.telegramId}</p>
            </div>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl text-[13px] transition-colors">
            <svg className={`w-4 h-4 transition-transform duration-300 ${open ? "" : "rotate-180"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
            {open && <span>Yopish</span>}
          </button>
        )}
        <button onClick={() => { localStorage.clear(); router.push("/"); }}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-[13px] transition-colors mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          {(open || mobile) && <span>Chiqish</span>}
        </button>
      </div>
    </aside>
  );

  const currentPage = menu.find((m) => m.href === pathname);

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      <div className="hidden md:flex fixed h-full z-30"><Sidebar /></div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[280px]"><Sidebar mobile /></div>
        </div>
      )}
      <main className={`flex-1 ${open ? "md:ml-[260px]" : "md:ml-[76px]"} transition-all duration-300`}>
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-400 hover:text-slate-600" title="Menu">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h1 className="font-bold text-slate-800 text-[15px]">{currentPage?.label || "Dashboard"}</h1>
              <p className="text-[11px] text-slate-400 font-medium">Hilal Bot boshqaruv paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-600 font-medium">Online</span>
            </div>
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl px-3 py-1.5">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}
              <span className="text-[12px] font-semibold text-slate-700 hidden sm:block">{user?.firstName}</span>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
