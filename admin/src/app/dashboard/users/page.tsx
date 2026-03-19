"use client";
import { useEffect, useState } from "react";
import { getUsers, setAdmin, blockUser, sendToUser } from "@/lib/api";

export default function UsersPage() {
  const [data, setData] = useState<any>({ users: [], total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [msgModal, setMsgModal] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const load = () => getUsers(page, 20, search || undefined).then(setData).catch(console.error);
  useEffect(() => { load(); }, [page, search]);

  const toggleAdmin = async (id: number, val: boolean) => { await setAdmin(id, val); load(); };
  const toggleBlock = async (id: number, val: boolean) => { await blockUser(id, val); load(); };
  const handleSend = async () => {
    if (!msgModal || !msg) return;
    await sendToUser(msgModal.telegramId, msg);
    setMsgModal(null); setMsg("");
    alert("Yuborildi!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-400 mt-0.5">Jami: {data.total || 0}</p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Qidirish..." className="w-72 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Telegram</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sana</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                        {u.firstName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-[13px]">{u.firstName} {u.lastName || ""}</p>
                        <p className="text-[11px] text-slate-400">@{u.username || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{u.telegramId}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {u.isAdmin && <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600">ADMIN</span>}
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${u.isBlocked ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>
                        {u.isBlocked ? "BLOCKED" : "AKTIV"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleAdmin(u.id, !u.isAdmin)} title={u.isAdmin ? "Admin olib tashlash" : "Admin qilish"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isAdmin ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                      </button>
                      <button onClick={() => toggleBlock(u.id, !u.isBlocked)} title={u.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isBlocked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={u.isBlocked ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"} /></svg>
                      </button>
                      <button onClick={() => setMsgModal(u)} title="Xabar yuborish"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {msgModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                {msgModal.firstName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{msgModal.firstName}ga xabar</h3>
                <p className="text-xs text-slate-400">ID: {msgModal.telegramId}</p>
              </div>
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl p-3.5 mb-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none" placeholder="Xabar yozing..." />
            <div className="flex gap-3">
              <button onClick={handleSend} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm">Yuborish</button>
              <button onClick={() => setMsgModal(null)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
