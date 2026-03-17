"use client";
import { useEffect, useState } from "react";
import { getAdminPlans, createPlan, updatePlan, deletePlan } from "@/lib/api";

const empty = { name: "", description: "", price: 0, durationDays: 30, features: "", isActive: true, sortOrder: 0 };

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ ...empty });
  const [editId, setEditId] = useState<number | null>(null);

  const load = () => getAdminPlans().then(setPlans).catch(console.error);
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...empty }); setEditId(null); setModal(true); };
  const openEdit = (p: any) => {
    setForm({ name: p.name, description: p.description || "", price: p.price, durationDays: p.durationDays, features: p.features || "", isActive: p.isActive, sortOrder: p.sortOrder });
    setEditId(p.id); setModal(true);
  };

  const save = async () => {
    const data = { ...form, price: Number(form.price), durationDays: Number(form.durationDays), sortOrder: Number(form.sortOrder) };
    if (editId) await updatePlan(editId, data); else await createPlan(data);
    setModal(false); load();
  };

  const remove = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await deletePlan(id); load();
  };

  const fmt = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Obuna rejalar</h1>
        <button onClick={openNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">➕ Yangi reja</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p: any) => (
          <div key={p.id} className={`bg-white rounded-xl shadow p-6 border-2 ${p.isActive ? "border-green-200" : "border-red-200"}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${p.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {p.isActive ? "Aktiv" : "Nofaol"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{p.description}</p>
            <div className="text-2xl font-bold text-indigo-600 mb-1">{fmt(p.price)}</div>
            <div className="text-sm text-gray-500 mb-3">📅 {p.durationDays} kun</div>
            {p.features && <p className="text-xs text-gray-400 mb-4">{p.features}</p>}
            <div className="text-xs text-gray-400 mb-3">
              Obunalar: {p._count?.subscriptions || 0} | Tartib: {p.sortOrder}
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm hover:bg-blue-100">✏️ Tahrirlash</button>
              <button onClick={() => remove(p.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm hover:bg-red-100">🗑️ O'chirish</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl text-gray-800 mb-4">{editId ? "✏️ Tahrirlash" : "➕ Yangi reja"}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Nomi</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-gray-800" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Tavsif</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-gray-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Narx (so'm)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-gray-800" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Muddat (kun)</label>
                  <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-gray-800" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Xususiyatlar</label>
                <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-gray-800" placeholder="Masalan: Video darslar, Guruh chati..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Tartib</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-gray-800" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-5 h-5 rounded" />
                    <span className="text-sm text-gray-600">Aktiv</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={save} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">💾 Saqlash</button>
              <button onClick={() => setModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200">Bekor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
