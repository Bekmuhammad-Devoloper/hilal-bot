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
    alert("✅ Yuborildi!");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">👥 Foydalanuvchilar</h1>
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Qidirish..." className="w-full md:w-80 px-4 py-2 border rounded-lg mb-4 text-gray-800" />
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">ID</th>
              <th className="px-4 py-3 text-left text-gray-600">Ism</th>
              <th className="px-4 py-3 text-left text-gray-600">Username</th>
              <th className="px-4 py-3 text-left text-gray-600">Telegram ID</th>
              <th className="px-4 py-3 text-left text-gray-600">Sana</th>
              <th className="px-4 py-3 text-left text-gray-600">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {data.users?.map((u: any) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{u.id}</td>
                <td className="px-4 py-3 text-gray-800">{u.firstName} {u.lastName || ""}</td>
                <td className="px-4 py-3 text-gray-500">@{u.username || "-"}</td>
                <td className="px-4 py-3 text-gray-800 font-mono">{u.telegramId}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-1 flex-wrap">
                  <button onClick={() => toggleAdmin(u.id, !u.isAdmin)} className={`px-2 py-1 rounded text-xs ${u.isAdmin ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-600"}`}>
                    {u.isAdmin ? "🔑 Admin" : "👤 User"}
                  </button>
                  <button onClick={() => toggleBlock(u.id, !u.isBlocked)} className={`px-2 py-1 rounded text-xs ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {u.isBlocked ? "🚫 Bloklangan" : "✅ Aktiv"}
                  </button>
                  <button onClick={() => setMsgModal(u)} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-600">💬</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.totalPages > 1 && (
        <div className="flex gap-2 mt-4 justify-center">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}>{i + 1}</button>
          ))}
        </div>
      )}
      {msgModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-gray-800 mb-3">💬 {msgModal.firstName}ga xabar</h3>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="w-full border rounded-lg p-3 mb-3 text-gray-800" placeholder="Xabar yozing..." />
            <div className="flex gap-2">
              <button onClick={handleSend} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg">Yuborish</button>
              <button onClick={() => setMsgModal(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
