"use client";
import { useEffect, useState } from "react";
import { broadcastAll, broadcastSelected, getBroadcastUsers } from "@/lib/api";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "photo" | "video">("none");
  const [mediaUrl, setMediaUrl] = useState("");
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // User selection
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  const loadUsers = async () => {
    if (users.length > 0) { setShowUsers(true); return; }
    setUsersLoading(true);
    try {
      const data = await getBroadcastUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch { }
    setUsersLoading(false);
    setShowUsers(true);
  };

  const toggleUser = (tgId: number) => {
    setSelectedIds(prev => prev.includes(tgId) ? prev.filter(id => id !== tgId) : [...prev, tgId]);
  };

  const selectAll = () => {
    if (selectedIds.length === filteredUsers.length) setSelectedIds([]);
    else setSelectedIds(filteredUsers.map((u: any) => Number(u.telegramId)));
  };

  const filteredUsers = users.filter((u: any) => {
    if (!userSearch) return true;
    const s = userSearch.toLowerCase();
    return (u.firstName || "").toLowerCase().includes(s) || (u.lastName || "").toLowerCase().includes(s) || (u.username || "").toLowerCase().includes(s);
  });

  const handleSend = async () => {
    if (!message.trim() && mediaType === "none") return alert("Xabar yozing!");
    if (mediaType !== "none" && !mediaUrl.trim()) return alert("Media URL kiriting!");
    if (target === "selected" && selectedIds.length === 0) return alert("Kamida 1 ta user tanlang!");

    const confirmMsg = target === "all"
      ? "Barcha foydalanuvchilarga yuborishni tasdiqlaysizmi?"
      : `${selectedIds.length} ta foydalanuvchiga yuborishni tasdiqlaysizmi?`;
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    setResult(null);
    try {
      const mType = mediaType === "none" ? undefined : mediaType;
      const mUrl = mediaType === "none" ? undefined : mediaUrl;
      let r;
      if (target === "all") {
        r = await broadcastAll(message, mType, mUrl);
      } else {
        r = await broadcastSelected(selectedIds, message, mType, mUrl);
      }
      setResult(r);
    } catch (e: any) {
      alert("Xatolik: " + (e.message || "Noma'lum"));
    } finally {
      setLoading(false);
    }
  };

  const mediaTypes = [
    { key: "none", label: "Faqat text", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
    { key: "photo", label: "Rasm", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" },
    { key: "video", label: "Video", icon: "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" },
  ];

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Xabar yuborish</h1>
        <p className="text-sm text-slate-400 mt-0.5">Foydalanuvchilarga text, rasm yoki video xabar</p>
      </div>

      {/* Target */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <label className="text-[12px] font-medium text-slate-500 mb-3 block">Kimga yuborish</label>
        <div className="flex gap-2">
          <button onClick={() => { setTarget("all"); setSelectedIds([]); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${target === "all" ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
              Barchaga
            </span>
          </button>
          <button onClick={() => { setTarget("selected"); loadUsers(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${target === "selected" ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              Tanlangan {selectedIds.length > 0 && `(${selectedIds.length})`}
            </span>
          </button>
        </div>

        {/* Selected users list */}
        {target === "selected" && (
          <div className="mt-4">
            {usersLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Qidirish..." className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none" />
                  </div>
                  <button onClick={selectAll} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium whitespace-nowrap px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors">
                    {selectedIds.length === filteredUsers.length ? "Barchasini bekor" : "Barchasini tanlash"}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-100 rounded-xl p-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 py-4">Foydalanuvchi topilmadi</p>
                  ) : filteredUsers.map((u: any) => {
                    const tgId = Number(u.telegramId);
                    const checked = selectedIds.includes(tgId);
                    return (
                      <div key={u.id} onClick={() => toggleUser(tgId)} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${checked ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent"}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                          {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                        </div>
                        {u.photoUrl ? (
                          <img src={u.photoUrl} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                            {(u.firstName || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-slate-700 truncate">{u.firstName || ""} {u.lastName || ""}</p>
                        </div>
                        <span className="text-[11px] text-slate-400">@{u.username || "—"}</span>
                      </div>
                    );
                  })}
                </div>
                {selectedIds.length > 0 && (
                  <p className="text-xs text-indigo-500 font-medium mt-2">{selectedIds.length} ta foydalanuvchi tanlandi</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Media type */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <label className="text-[12px] font-medium text-slate-500 mb-3 block">Xabar turi</label>
        <div className="flex gap-2">
          {mediaTypes.map(mt => (
            <button key={mt.key} onClick={() => { setMediaType(mt.key as any); setMediaUrl(""); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mediaType === mt.key ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={mt.icon} /></svg>
                {mt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Media URL */}
        {mediaType !== "none" && (
          <div className="mt-4">
            <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
              {mediaType === "photo" ? "Rasm URL" : "Video URL"}
            </label>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={mediaType === "photo" ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
            />
            {/* Preview */}
            {mediaUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                {mediaType === "photo" ? (
                  <img src={mediaUrl} alt="Preview" className="max-h-48 w-full object-contain" onError={(e) => { (e.target as any).style.display = "none"; }} />
                ) : (
                  <video src={mediaUrl} controls className="max-h-48 w-full" onError={(e) => { (e.target as any).style.display = "none"; }} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message text */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">
          Xabar matni {mediaType !== "none" && "(ixtiyoriy — caption sifatida)"}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none"
          placeholder={"Xabar matnini yozing...\n\nHTML formatlash:\n<b>Qalin</b>  <i>Kursiv</i>  <a href='link'>Havola</a>"}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-400">{message.length} belgi</span>
          <button
            onClick={handleSend}
            disabled={loading || (!message.trim() && mediaType === "none") || (mediaType !== "none" && !mediaUrl.trim()) || (target === "selected" && selectedIds.length === 0)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-7 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                {target === "all" ? "Barchaga yuborish" : `${selectedIds.length} taga yuborish`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h3 className="font-semibold text-emerald-700 text-[14px]">Natija</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-emerald-600">{result.sent || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Yuborildi</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-red-500">{result.failed || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Xato</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-700">{result.total || 0}</p>
              <p className="text-[11px] text-slate-400 font-medium">Jami</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
          <h3 className="font-semibold text-blue-700 text-[13px]">Maslahatlar</h3>
        </div>
        <div className="space-y-1.5 text-[12px] text-blue-600/80">
          <p>• HTML: <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;b&gt;</code> <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;i&gt;</code> <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;a href=&apos;...&apos;&gt;</code></p>
          <p>• Rasm/video URL to&apos;g&apos;ridan-to&apos;g&apos;ri Telegram API orqali yuboriladi</p>
          <p>• Rasm/video bilan birga matn caption sifatida qo&apos;shiladi</p>
          <p>• Emoji ishlatish mumkin 🎉</p>
        </div>
      </div>
    </div>
  );
}
