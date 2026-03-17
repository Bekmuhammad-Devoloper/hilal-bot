"use client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "channelUsername", label: "📢 Kanal username", placeholder: "@gulomjonhoca", desc: "Telegram kanal username (@ bilan)" },
    { key: "channelUrl", label: "🔗 Kanal havola", placeholder: "https://t.me/gulomjonhoca", desc: "Kanal uchun to'liq havola" },
    { key: "inviteLink", label: "🎫 Taklif havolasi", placeholder: "https://t.me/+...", desc: "Kanalga a'zo bo'lish uchun taklif havolasi" },
    { key: "adminIds", label: "🔑 Admin IDlar", placeholder: "6340537709,8155313883", desc: "Admin Telegram ID lari (vergul bilan)" },
    { key: "paymeNumber", label: "💠 Payme raqam", placeholder: "8600...", desc: "Payme to'lov uchun karta raqami" },
    { key: "clickNumber", label: "💳 Click raqam", placeholder: "8600...", desc: "Click to'lov uchun karta raqami" },
    { key: "welcomeMessage", label: "👋 Xush kelibsiz xabar", placeholder: "Oson Turk Tili kursiga xush kelibsiz!", desc: "Yangi foydalanuvchilar uchun salomlashuv xabari", multiline: true },
    { key: "supportContact", label: "📞 Aloqa", placeholder: "@admin_username", desc: "Yordam uchun murojaat kontakti" },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">⚙️ Sozlamalar</h1>

      {saved && (
        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg mb-4 text-sm">
          ✅ Saqlandi!
        </div>
      )}

      <div className="space-y-4">
        {fields.map((f: any) => (
          <div key={f.key} className="bg-white rounded-xl shadow p-5">
            <label className="block font-medium text-gray-800 mb-1">{f.label}</label>
            <p className="text-xs text-gray-400 mb-2">{f.desc}</p>
            {f.multiline ? (
              <textarea
                value={settings[f.key] || ""}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                rows={3}
                placeholder={f.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-gray-800 mb-2"
              />
            ) : (
              <input
                value={settings[f.key] || ""}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full border rounded-lg px-3 py-2 text-gray-800 mb-2"
              />
            )}
            <button
              onClick={() => handleSave(f.key, settings[f.key] || "")}
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              💾 Saqlash
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
