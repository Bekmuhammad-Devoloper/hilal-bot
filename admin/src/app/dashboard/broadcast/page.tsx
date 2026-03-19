"use client";
import { useRef, useState } from "react";
import { broadcastAll, broadcastSelected, getBroadcastUsers, uploadFile } from "@/lib/api";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "photo" | "video">("none");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // User selection
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const loadUsers = async () => {
    if (usersLoaded && users.length > 0) return;
    setUsersLoading(true);
    try {
      const data = await getBroadcastUsers();
      setUsers(Array.isArray(data) ? data : []);
      setUsersLoaded(true);
    } catch {
      setUsers([]);
    }
    setUsersLoading(false);
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

  // ===== FILE UPLOAD =====
  const handleFileUpload = async (file: File) => {
    // Validate type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (mediaType === "photo" && !isImage) return alert("Faqat rasm fayllar ruxsat etilgan!");
    if (mediaType === "video" && !isVideo) return alert("Faqat video fayllar ruxsat etilgan!");
    if (file.size > 50 * 1024 * 1024) return alert("Fayl hajmi 50 MB dan oshmasligi kerak!");

    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(p => Math.min(p + 10, 90));
    }, 200);

    try {
      const res = await uploadFile(file);
      if (res && res.url) {
        setMediaUrl(res.url);
        setUploadProgress(100);
      }
    } catch (e: any) {
      alert("Yuklashda xato: " + (e?.response?.data?.message || e.message || "Noma'lum"));
    } finally {
      clearInterval(interval);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSend = async () => {
    if (!message.trim() && mediaType === "none") return alert("Xabar yozing!");
    if (mediaType !== "none" && !mediaUrl.trim()) return alert("Rasm/video yuklang yoki URL kiriting!");
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

  const clearMedia = () => {
    setMediaUrl("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const mediaTypes = [
    { key: "none", label: "Faqat text", icon: "M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" },
    { key: "photo", label: "Rasm", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" },
    { key: "video", label: "Video", icon: "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" },
  ];

  // Build preview URL: for local uploads prefix with backend URL
  const getPreviewUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) {
      const base = typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:7777"
        : "";
      return base + url;
    }
    return url;
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Xabar yuborish</h1>
        <p className="text-sm text-slate-400 mt-0.5">Foydalanuvchilarga text, rasm yoki video xabar</p>
      </div>

      {/* ===== Target ===== */}
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
                    {selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? "Barchasini bekor" : "Barchasini tanlash"}
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

      {/* ===== Media type ===== */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <label className="text-[12px] font-medium text-slate-500 mb-3 block">Xabar turi</label>
        <div className="flex gap-2">
          {mediaTypes.map(mt => (
            <button key={mt.key} onClick={() => { setMediaType(mt.key as any); clearMedia(); }} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mediaType === mt.key ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={mt.icon} /></svg>
                {mt.label}
              </span>
            </button>
          ))}
        </div>

        {/* ===== Upload area ===== */}
        {mediaType !== "none" && (
          <div className="mt-4 space-y-3">
            {/* Drag & drop / click upload zone */}
            {!mediaUrl && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={mediaType === "photo" ? "image/*" : "video/*"}
                  className="hidden"
                  title={mediaType === "photo" ? "Rasm tanlang" : "Video tanlang"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                {uploading ? (
                  <div className="space-y-3">
                    <div className="w-10 h-10 mx-auto border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-indigo-600 font-medium">Yuklanmoqda...</p>
                    <div className="w-48 mx-auto bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-indigo-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {mediaType === "photo" ? "Rasm yuklash" : "Video yuklash"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Faylni shu yerga tashlang yoki bosing (max 50 MB)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* OR separator */}
            {!mediaUrl && !uploading && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">yoki URL kiriting</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}

            {/* URL input */}
            {!mediaUrl && (
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={mediaType === "photo" ? "https://example.com/image.jpg" : "https://example.com/video.mp4"}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all"
              />
            )}

            {/* Preview with remove button */}
            {mediaUrl && (
              <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                <button
                  onClick={clearMedia}
                  title="O'chirish"
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {mediaType === "photo" ? (
                  <img src={getPreviewUrl(mediaUrl)} alt="Preview" className="max-h-64 w-full object-contain" onError={(e) => { (e.target as any).style.display = "none"; }} />
                ) : (
                  <video src={getPreviewUrl(mediaUrl)} controls className="max-h-64 w-full" onError={(e) => { (e.target as any).style.display = "none"; }} />
                )}
                <div className="px-3 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  <span className="text-xs text-emerald-600 font-medium">
                    {mediaUrl.startsWith("/uploads/") ? "Fayl yuklandi" : "URL kiritildi"} — tayyor
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Message text ===== */}
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

      {/* ===== Result ===== */}
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

      {/* ===== Tips ===== */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
          <h3 className="font-semibold text-blue-700 text-[13px]">Maslahatlar</h3>
        </div>
        <div className="space-y-1.5 text-[12px] text-blue-600/80">
          <p>• Rasm/video: faylni yuklang yoki URL kiriting</p>
          <p>• HTML: <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;b&gt;</code> <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;i&gt;</code> <code className="bg-blue-100/60 text-blue-700 px-1 py-0.5 rounded text-[11px] font-mono">&lt;a href=&apos;...&apos;&gt;</code></p>
          <p>• Rasm/video bilan birga matn caption sifatida qo&apos;shiladi</p>
          <p>• Maksimal fayl hajmi: 50 MB</p>
          <p>• Emoji ishlatish mumkin 🎉</p>
        </div>
      </div>
    </div>
  );
}
