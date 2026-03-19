"use client";
import { useEffect, useState } from "react";
import { getAdminPlans, createPlan, updatePlan, deletePlan } from "@/lib/api";

const empty = { name: "", description: "", price: 0, duration: 30, features: "", isActive: true, sortOrder: 0 };

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ ...empty });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getAdminPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setModal(true); };
  const openEdit = (p: any) => {
    let features = p.features || "";
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) features = parsed.join(", ");
    } catch {}
    setForm({ name: p.name, description: p.description || "", price: p.price, duration: p.duration, features, isActive: p.isActive, sortOrder: p.sortOrder });
    setEditId(p.id); setModal(true);
  };

  const save = async () => {
    const featuresList = form.features ? form.features.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
    const data = { ...form, price: Number(form.price), duration: Number(form.duration), sortOrder: Number(form.sortOrder), features: JSON.stringify(featuresList) };
    if (editId) await updatePlan(editId, data); else await createPlan(data);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await deletePlan(id); load();
  };

  const fmt = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

  const parseFeatures = (f: string): string[] => {
    if (!f) return [];
    try {
      const parsed = JSON.parse(f);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return f.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Yuklab bo'lmadi</p>
            <p className="text-xs text-slate-400 mt-1">Server bilan aloqa uzildi</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 bg-violet-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-violet-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Obuna rejalar</h1>
          <p className="text-sm text-slate-400 mt-0.5">Jami: {plans.length} ta reja</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Yangi reja
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 group">
            <div className={`h-1.5 ${p.isActive ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-slate-200 to-slate-300"}`} />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.isActive ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                  </div>
                  <h3 className="font-bold text-[15px] text-slate-800">{p.name}</h3>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold ${p.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  {p.isActive ? "AKTIV" : "NOFAOL"}
                </span>
              </div>

              {p.description && <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">{p.description}</p>}

              <div className="mb-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">{fmt(p.price)}</div>
                <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  {p.duration} kunlik
                </div>
              </div>

              {p.features && (
                <div className="mb-4 space-y-1.5">
                  {parseFeatures(p.features).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] text-slate-500">
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <span>{f.trim()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4 pt-3 border-t border-slate-50">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  {p._count?.subscriptions || 0} obuna
                </span>
                <span>Tartib: {p.sortOrder}</span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-50 text-slate-600 py-2.5 rounded-xl text-[13px] hover:bg-slate-100 transition-colors font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                  Tahrirlash
                </button>
                <button onClick={() => remove(p.id)} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 text-red-500 py-2.5 rounded-xl text-[13px] hover:bg-red-100 transition-colors font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  O'chirish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={editId ? "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" : "M12 4.5v15m7.5-7.5h-15"} /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">{editId ? "Rejani tahrirlash" : "Yangi reja qo'shish"}</h3>
                <p className="text-[11px] text-slate-400">Barcha maydonlarni to'ldiring</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Nomi</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="Masalan: Premium" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Tavsif</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all resize-none" placeholder="Reja haqida qisqacha..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Narx (so'm)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Muddat (kun)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="30" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Xususiyatlar</label>
                <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" placeholder="Video darslar, Guruh chati, ..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Tartib</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} placeholder="0" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div className="relative">
                      <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="sr-only peer" />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-indigo-600 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm peer-checked:translate-x-[18px] transition-transform" />
                    </div>
                    <span className="text-sm text-slate-600">Aktiv</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all font-medium text-sm">
                Saqlash
              </button>
              <button onClick={() => setModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
