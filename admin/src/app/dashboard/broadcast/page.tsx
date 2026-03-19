"use client";
import { useState } from "react";
import { broadcastAll } from "@/lib/api";

export default function BroadcastPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    if (!message.trim()) return alert("Xabar yozing!");
    if (!confirm("Barcha foydalanuvchilarga yuborishni tasdiqlaysizmi?")) return;
    setLoading(true);
    try {
      const r = await broadcastAll(message);
      setResult(r);
      setMessage("");
    } catch (e: any) {
      alert("Xatolik: " + (e.message || "Noma'lum"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Xabar yuborish</h1>
        <p className="text-sm text-slate-400 mt-0.5">Barcha foydalanuvchilarga ommaviy xabar</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="mb-5">
          <label className="text-[12px] font-medium text-slate-500 mb-2 block">Xabar matni</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none"
            placeholder={"Barcha foydalanuvchilarga yuboriladigan xabarni yozing...\n\nHTML formatlash qo'llab-quvvatlanadi:\n<b>Qalin matn</b>\n<i>Kursiv matn</i>\n<a href='link'>Havola</a>"}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
            {message.length} belgi
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all text-sm font-medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                Yuborish
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-emerald-50 rounded-xl p-5 border border-emerald-100">
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
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
          </div>
          <h3 className="font-semibold text-blue-700 text-[14px]">Maslahatlar</h3>
        </div>
        <div className="space-y-2.5">
          {[
            { text: "HTML formatlash:", code: "<b>, <i>, <a href='...'>" },
            { text: "Emoji ishlatish mumkin 🎉", code: null },
            { text: "Faqat bloklanmagan foydalanuvchilarga yuboriladi", code: null },
            { text: "Ko'p foydalanuvchi bo'lsa, biroz vaqt olishi mumkin", code: null },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-[13px] text-blue-600/80">
              <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <span>{tip.text}{tip.code && <code className="bg-blue-100/60 text-blue-700 px-1.5 py-0.5 rounded text-[11px] ml-1 font-mono">{tip.code}</code>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
