"use client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((data) => {
      const obj: any = {};
      if (Array.isArray(data)) data.forEach((s: any) => (obj[s.key] = s.value));
      else if (data && typeof data === "object") Object.assign(obj, data);
      setSettings(obj);
    }).catch(console.error);
  }, []);

  const handleSave = async (key: string, value: string) => {
    setLoading(true);
    try {
      await updateSettings(key, value);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (e) {
      alert("Xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "channelUsername", label: "Kanal username", placeholder: "@gulomjonhoca", desc: "Telegram kanal username (@ bilan)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>,
      color: "from-blue-500 to-indigo-600",
    },
    {
      key: "channelUrl", label: "Kanal havola", placeholder: "https://t.me/gulomjonhoca", desc: "Kanal uchun to'liq havola",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
      color: "from-cyan-500 to-blue-600",
    },
    {
      key: "inviteLink", label: "Taklif havolasi", placeholder: "https://t.me/+...", desc: "Kanalga a'zo bo'lish uchun taklif havolasi",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>,
      color: "from-violet-500 to-purple-600",
    },
    {
      key: "adminIds", label: "Admin IDlar", placeholder: "6340537709,8155313883", desc: "Admin Telegram ID lari (vergul bilan)",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>,
      color: "from-amber-500 to-orange-600",
    },
    {
      key: "paymeNumber", label: "Payme raqam", placeholder: "8600...", desc: "Payme to'lov uchun karta raqami",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
      color: "from-emerald-500 to-teal-600",
    },
    {
      key: "clickNumber", label: "Click raqam", placeholder: "8600...", desc: "Click to'lov uchun karta raqami",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
      color: "from-blue-500 to-blue-600",
    },
    {
      key: "welcomeMessage", label: "Xush kelibsiz xabar", placeholder: "Oson Turk Tili kursiga xush kelibsiz!", desc: "Yangi foydalanuvchilar uchun salomlashuv xabari", multiline: true,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>,
      color: "from-pink-500 to-rose-600",
    },
    {
      key: "supportContact", label: "Aloqa", placeholder: "@admin_username", desc: "Yordam uchun murojaat kontakti",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
      color: "from-indigo-500 to-violet-600",
    },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Sozlamalar</h1>
        <p className="text-sm text-slate-400 mt-0.5">Bot va tizim sozlamalari</p>
      </div>

      <div className="space-y-4">
        {fields.map((f: any) => (
          <div key={f.key} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-sm transition-shadow">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white flex-shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <label className="font-semibold text-slate-800 text-[14px] block">{f.label}</label>
                  <p className="text-[11px] text-slate-400">{f.desc}</p>
                </div>
              </div>
              {f.multiline ? (
                <textarea
                  value={settings[f.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  rows={3}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none mb-3"
                />
              ) : (
                <input
                  value={settings[f.key] || ""}
                  onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all mb-3"
                />
              )}
              <button
                onClick={() => handleSave(f.key, settings[f.key] || "")}
                disabled={loading}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  saved === f.key
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                } disabled:opacity-50`}
              >
                {saved === f.key ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    Saqlandi
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                    Saqlash
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
