"use client";"use client";

import { useEffect, useState } from "react";import { useEffect, useState } from "react";

import { getUsers, setAdmin, blockUser, sendToUser } from "@/lib/api";import { getUsers, setAdmin, blockUser, sendToUser } from "@/lib/api";



export default function UsersPage() {export default function UsersPage() {

  const [data, setData] = useState<any>({ users: [], total: 0, totalPages: 0 });  const [data, setData] = useState<any>({ users: [], total: 0, totalPages: 0 });

  const [page, setPage] = useState(1);  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");  const [search, setSearch] = useState("");

  const [msgModal, setMsgModal] = useState<any>(null);  const [msgModal, setMsgModal] = useState<any>(null);

  const [msg, setMsg] = useState("");  const [msg, setMsg] = useState("");



  const load = () => getUsers(page, 20, search || undefined).then(setData).catch(console.error);  const load = () => getUsers(page, 20, search || undefined).then(setData).catch(console.error);

  useEffect(() => { load(); }, [page, search]);  useEffect(() => { load(); }, [page, search]);



  const toggleAdmin = async (id: number, val: boolean) => { await setAdmin(id, val); load(); };  const toggleAdmin = async (id: number, val: boolean) => { await setAdmin(id, val); load(); };

  const toggleBlock = async (id: number, val: boolean) => { await blockUser(id, val); load(); };  const toggleBlock = async (id: number, val: boolean) => { await blockUser(id, val); load(); };

  const handleSend = async () => {  const handleSend = async () => {

    if (!msgModal || !msg) return;    if (!msgModal || !msg) return;

    await sendToUser(msgModal.telegramId, msg);    await sendToUser(msgModal.telegramId, msg);

    setMsgModal(null); setMsg("");    setMsgModal(null); setMsg("");

    alert("Yuborildi!");    alert("Yuborildi!");

  };  };



  return (  return (

    <div className="space-y-6">    <div className="space-y-6">

      <div className="flex flex-wrap justify-between items-center gap-3">      <div className="flex flex-wrap justify-between items-center gap-3">

        <div className="flex items-center gap-4">        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">

            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />

            </svg>            </svg>

          </div>          </div>

          <div>          <div>

            <h1 className="text-xl font-bold text-slate-800">Foydalanuvchilar</h1>            <h1 className="text-xl font-bold text-slate-800">Foydalanuvchilar</h1>

            <p className="text-sm text-slate-400 mt-0.5">Jami foydalanuvchilar: <span className="font-semibold text-indigo-600">{data.total || 0}</span></p>            <p className="text-sm text-slate-400 mt-0.5">Jami foydalanuvchilar: <span className="font-semibold text-indigo-600">{data.total || 0}</span></p>

          </div>          </div>

        </div>        </div>

        <div className="relative">        <div className="relative">

          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>

          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}

            placeholder="Qidirish..." className="w-72 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />            placeholder="Qidirish..." className="w-72 pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />

        </div>        </div>

      </div>      </div>



      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

        <div className="overflow-x-auto">        <div className="overflow-x-auto">

          <table className="w-full text-sm">          <table className="w-full text-sm">

            <thead>            <thead>

              <tr className="border-b border-slate-100">              <tr className="border-b border-slate-100">

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Foydalanuvchi</th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Telegram</th>                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Telegram</th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Obuna</th>                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">To&apos;lov turi</th>                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sana</th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amallar</th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Amallar</th>              </tr>

              </tr>            </thead>

            </thead>            <tbody className="divide-y divide-slate-50">

            <tbody className="divide-y divide-slate-50">              {data.users?.map((u: any) => (

              {data.users?.map((u: any) => (                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">

                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">                  <td className="px-5 py-3.5">

                  <td className="px-5 py-3.5">                    <div className="flex items-center gap-3">

                    <div className="flex items-center gap-3">                      {u.photoUrl ? (

                      {u.photoUrl ? (                        <img src={u.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />

                        <img src={u.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />                      ) : (

                      ) : (                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">

                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">                          {u.firstName?.charAt(0)?.toUpperCase() || "?"}

                          {u.firstName?.charAt(0)?.toUpperCase() || "?"}                        </div>

                        </div>                      )}

                      )}                      <div>

                      <div>                        <p className="font-medium text-slate-800 text-[13px]">{u.firstName} {u.lastName || ""}</p>

                        <p className="font-medium text-slate-800 text-[13px]">{u.firstName} {u.lastName || ""}</p>                        <p className="text-[11px] text-slate-400">@{u.username || "—"}</p>

                        <p className="text-[11px] text-slate-400">@{u.username || "\u2014"}</p>                      </div>

                      </div>                    </div>

                    </div>                  </td>

                  </td>                  <td className="px-5 py-3.5">

                  <td className="px-5 py-3.5">                    <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{u.telegramId}</span>

                    <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">{u.telegramId}</span>                  </td>

                  </td>                  <td className="px-5 py-3.5">

                  <td className="px-5 py-3.5">                    <div className="flex items-center gap-1.5">

                    {u.activeSubscription ? (                      {u.isAdmin && <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600">ADMIN</span>}

                      <div className="space-y-1">                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${u.isBlocked ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>

                        <p className="text-[11px] font-semibold text-indigo-600">{u.activeSubscription.planName}</p>                        {u.isBlocked ? "BLOCKED" : "AKTIV"}

                        <div className="flex items-center gap-1.5">                      </span>

                          <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">                    </div>

                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />                  </td>

                          </svg>                  <td className="px-5 py-3.5 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString("uz-UZ")}</td>

                          <span className="text-[10px] text-slate-500">                  <td className="px-5 py-3.5">

                            {new Date(u.activeSubscription.startDate).toLocaleDateString("uz-UZ")}                    <div className="flex items-center gap-1.5">

                          </span>                      <button onClick={() => toggleAdmin(u.id, !u.isAdmin)} title={u.isAdmin ? "Admin olib tashlash" : "Admin qilish"}

                          <span className="text-[10px] text-slate-300">{"\u2192"}</span>                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isAdmin ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>

                          <span className={`text-[10px] font-medium ${new Date(u.activeSubscription.endDate) < new Date() ? "text-red-500" : "text-emerald-600"}`}>                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>

                            {new Date(u.activeSubscription.endDate).toLocaleDateString("uz-UZ")}                      </button>

                          </span>                      <button onClick={() => toggleBlock(u.id, !u.isBlocked)} title={u.isBlocked ? "Blokdan chiqarish" : "Bloklash"}

                        </div>                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isBlocked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>

                      </div>                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={u.isBlocked ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"} /></svg>

                    ) : (                      </button>

                      <span className="text-[11px] text-slate-300 italic">Obuna yo&apos;q</span>                      <button onClick={() => setMsgModal(u)} title="Xabar yuborish"

                    )}                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">

                  </td>                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>

                  <td className="px-5 py-3.5">                      </button>

                    {u.lastPaymentMethod ? (                    </div>

                      <div className="flex items-center gap-2">                  </td>

                        {u.lastPaymentMethod === "click" ? (                </tr>

                          <img src="/click-01.png" alt="Click" className="h-5 object-contain" />              ))}

                        ) : u.lastPaymentMethod === "payme" ? (            </tbody>

                          <img src="/payme-01.png" alt="Payme" className="h-5 object-contain" />          </table>

                        ) : (        </div>

                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-50 text-slate-500 uppercase">      </div>

                            {u.lastPaymentMethod}

                          </span>      {data.totalPages > 1 && (

                        )}        <div className="flex gap-1.5 justify-center">

                      </div>          {Array.from({ length: data.totalPages }, (_, i) => (

                    ) : (            <button key={i} onClick={() => setPage(i + 1)}

                      <span className="text-[11px] text-slate-300 italic">{"\u2014"}</span>              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i + 1 ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>

                    )}              {i + 1}

                  </td>            </button>

                  <td className="px-5 py-3.5">          ))}

                    <div className="flex items-center gap-1.5">        </div>

                      {u.isAdmin && <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600">ADMIN</span>}      )}

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${u.isBlocked ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"}`}>

                        {u.isBlocked ? "BLOCKED" : "AKTIV"}      {msgModal && (

                      </span>        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">

                    </div>          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">

                  </td>            <div className="flex items-center gap-3 mb-4">

                  <td className="px-5 py-3.5">              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">

                    <div className="flex items-center gap-1.5">                {msgModal.firstName?.charAt(0)?.toUpperCase() || "?"}

                      <button onClick={() => toggleAdmin(u.id, !u.isAdmin)} title={u.isAdmin ? "Admin olib tashlash" : "Admin qilish"}              </div>

                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isAdmin ? "bg-amber-50 text-amber-500 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>              <div>

                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>                <h3 className="font-bold text-slate-800">{msgModal.firstName}ga xabar</h3>

                      </button>                <p className="text-xs text-slate-400">ID: {msgModal.telegramId}</p>

                      <button onClick={() => toggleBlock(u.id, !u.isBlocked)} title={u.isBlocked ? "Blokdan chiqarish" : "Bloklash"}              </div>

                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.isBlocked ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"}`}>            </div>

                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={u.isBlocked ? "M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" : "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"} /></svg>            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="w-full border border-slate-200 rounded-xl p-3.5 mb-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none resize-none" placeholder="Xabar yozing..." />

                      </button>            <div className="flex gap-3">

                      <button onClick={() => setMsgModal(u)} title="Xabar yuborish"              <button onClick={handleSend} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm">Yuborish</button>

                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors">              <button onClick={() => setMsgModal(null)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm">Bekor</button>

                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>            </div>

                      </button>          </div>

                    </div>        </div>

                  </td>      )}

                </tr>    </div>

              ))}  );

            </tbody>}

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
              {msgModal.photoUrl ? (
                <img src={msgModal.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold">
                  {msgModal.firstName?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
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
