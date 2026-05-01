import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ommaviy oferta — Hilal Edu",
  description: "Hilal Edu xizmat ko'rsatish shartlari va ommaviy oferta",
};

export default function OfertaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a2a] via-[#1a1145] to-[#0f0a2a] text-white">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-900/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-2">Ommaviy oferta</h1>
          <p className="text-indigo-300/60 text-sm">Xizmat ko{"'"}rsatish shartlari</p>
          <p className="text-indigo-300/40 text-xs mt-2">Oxirgi yangilanish: 2026-yil 19-aprel</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Merchant rekvizitlari */}
          <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-400/15">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm font-bold">📋</span>
              Xizmat ko{"'"}rsatuvchi rekvizitlari
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-2">
              <div className="bg-white/[0.05] rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Tashkiliy-huquqiy shakli:</span>
                  <span className="text-white text-sm text-right">Mas{"'"}uliyati cheklangan jamiyat (MCHJ)</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">To{"'"}liq nomi:</span>
                  <span className="text-white font-semibold text-right">{'"'}Hilol Edu{'"'} MCHJ</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Direktor:</span>
                  <span className="text-white text-sm text-right">Umarjon Sobirov</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">INN (STIR):</span>
                  <span className="text-white font-mono text-sm">307 893 009</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Yuridik manzil:</span>
                  <span className="text-white text-sm text-right">Toshkent shahri, Chilonzor tumani, Muqimiy ko{"'"}chasi, 142/1</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Telefon:</span>
                  <span className="text-white font-mono text-sm">+998 (55) 519-78-78</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Bank:</span>
                  <span className="text-white text-sm text-right">{'"'}Orient Finans{'"'} HATB Chilonzor BXM</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Hisob raqam (x/r):</span>
                  <span className="text-white font-mono text-sm text-right">2020 8000 2053 0419 2003</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">MFO bank kodi:</span>
                  <span className="text-white font-mono text-sm">01071</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Telegram bot:</span>
                  <span className="text-white text-sm text-right">@oson_turktili_bot</span>
                </div>
                <div className="border-t border-white/[0.06]" />
                <div className="flex justify-between items-start gap-3">
                  <span className="text-indigo-300/50 text-xs flex-shrink-0">Web-sayt:</span>
                  <span className="text-white text-sm text-right">hilal-bot.bekmuhammad.uz</span>
                </div>
              </div>
              <p className="text-[11px] text-indigo-300/40 mt-3 leading-relaxed">
                * Ushbu rekvizitlar O{"'"}zbekiston Respublikasi qonunchiligiga muvofiq Davlat xizmatlari markazida ro{"'"}yxatdan o{"'"}tkazilgan.
                Pul mablag{"'"}lari faqat yuqorida ko{"'"}rsatilgan bank hisob raqamiga, Payme yoki Click to{"'"}lov tizimi orqali qabul qilinadi.
              </p>
            </div>
          </section>

          {/* Umumiy qoidalar */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
              Umumiy qoidalar
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>1.1. Ushbu ommaviy oferta (bundan buyon — &quot;Oferta&quot;) <strong className="text-white">&quot;Hilol Edu&quot; MCHJ</strong> (INN: 307 893 009, bundan buyon — &quot;Xizmat ko{"'"}rsatuvchi&quot;) tomonidan O{"'"}zbekiston Respublikasi Fuqarolik kodeksining 367-, 369-, 370-moddalariga muvofiq jismoniy shaxslarga (bundan buyon — &quot;Foydalanuvchi&quot;) taqdim etiladigan ta{"'"}limiy xizmatlar shartlarini belgilaydi.</p>
              <p>1.2. Xizmat ko{"'"}rsatuvchining tijoriy nomi — <strong className="text-white">Hilal Edu</strong>. Loyiha &quot;Oson Turk Tili&quot; nomi ostida faoliyat yuritadi.</p>
              <p>1.3. Platformada ro{"'"}yxatdan o{"'"}tish yoki to{"'"}lov amalga oshirish (aksept) orqali Foydalanuvchi ushbu Oferta shartlarini to{"'"}liq va so{"'"}zsiz qabul qiladi (FK 370-modda 3-band).</p>
              <p>1.4. Xizmat Telegram bot (<strong className="text-white">@oson_turktili_bot</strong>) va bog{"'"}liq web-ilova (Mini App) orqali ko{"'"}rsatiladi.</p>
              <p>1.5. Foydalanuvchi 18 yoshga to{"'"}lgan va to{"'"}lovni mustaqil amalga oshirish huquqiga ega bo{"'"}lishi shart. Voyaga yetmaganlar ota-onasi yoki vasiysi roziligi bilan foydalanishlari mumkin.</p>
            </div>
          </section>

          {/* Xizmat tavsifi */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm font-bold">2</span>
              Xizmat tavsifi
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>2.1. Hilal Edu — turk tilini o{"'"}rganish bo{"'"}yicha ta{"'"}limiy kontent platformasi.</p>
              <p>2.2. Foydalanuvchi obuna orqali quyidagi xizmatlarga kirish huquqiga ega bo{"'"}ladi:</p>
              <ul className="list-disc list-inside ml-4 space-y-1.5">
                <li>Eksklyuziv ta{"'"}limiy videodarslar</li>
                <li>Matnli darsliklar va qo{"'"}llanmalar</li>
                <li>Savol-javob mashqlari</li>
                <li>Maxsus Telegram kanalga kirish</li>
                <li>Haftada 2 ta yangi dars (dushanba va payshanba kunlari)</li>
              </ul>
            </div>
          </section>

          {/* Obuna narxi va to'lov */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-sm font-bold">3</span>
              Obuna narxi va to{"'"}lov tartibi
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>3.1. Obuna rejalari va narxlari:</p>
              <div className="bg-white/[0.05] rounded-xl p-4 space-y-3 my-3">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                  <div>
                    <p className="text-white font-semibold">Oson Turk Tili</p>
                    <p className="text-indigo-300/50 text-xs">Oylik obuna — 30 kun</p>
                  </div>
                  <p className="text-white font-bold text-lg">67 000 <span className="text-xs text-indigo-300/50 font-normal">so{"'"}m</span></p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">Premium obuna</p>
                    <p className="text-indigo-300/50 text-xs">3 oylik obuna — 90 kun</p>
                  </div>
                  <p className="text-white font-bold text-lg">180 000 <span className="text-xs text-indigo-300/50 font-normal">so{"'"}m</span></p>
                </div>
              </div>
              <p>3.2. To{"'"}lov quyidagi usullar orqali amalga oshiriladi:</p>
              <ul className="list-disc list-inside ml-4 space-y-1.5">
                <li><strong className="text-white">Payme</strong> — bank kartasi orqali</li>
                <li><strong className="text-white">Click</strong> — bank kartasi orqali</li>
              </ul>
              <p>3.3. To{"'"}lov muvaffaqiyatli amalga oshgandan so{"'"}ng obuna darhol faollashadi.</p>
              <p>3.4. Barcha narxlar O{"'"}zbekiston so{"'"}mida (UZS) ko{"'"}rsatilgan.</p>
              <p>3.5. To{"'"}lov tizimlari shartlari:</p>
              <div className="space-y-2 mt-2">
                <a href="https://cdn.payme.uz/terms/ru/main.html" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00CCCC] to-[#00AAAA] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xs">P</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Payme ommaviy oferta</p>
                    <p className="text-indigo-300/40 text-xs">cdn.payme.uz/terms/ru/main.html</p>
                  </div>
                  <svg className="w-4 h-4 text-indigo-300/40 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
                <a href="https://click.uz/ru/oferta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00AAFF] to-[#0088DD] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xs">C</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Click ofertasi</p>
                    <p className="text-indigo-300/40 text-xs">click.uz/ru/oferta</p>
                  </div>
                  <svg className="w-4 h-4 text-indigo-300/40 ml-auto" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
              </div>
              <p className="text-indigo-300/40 text-xs mt-2">To{"'"}lov amalga oshirish orqali Foydalanuvchi yuqoridagi to{"'"}lov tizimlari oferta shartlarini ham qabul qiladi.</p>
            </div>
          </section>

          {/* Avtomatik to'lov */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 text-sm font-bold">4</span>
              Avtomatik to{"'"}lov
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>4.1. Har oy belgilangan summa avtomatik ravishda Foydalanuvchining kartasidan yechib olinadi.</p>
              <p>4.2. Avtomatik to{"'"}lov obuna faol bo{"'"}lgan davr mobaynida davom etadi.</p>
              <p>4.3. Foydalanuvchi avtomatik to{"'"}lovni istalgan vaqtda bekor qilishi mumkin.</p>
            </div>
          </section>

          {/* Bekor qilish */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center text-rose-400 text-sm font-bold">5</span>
              Obunani bekor qilish
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>5.1. Obunani istalgan vaqtda bekor qilish mumkin.</p>
              <p>5.2. Bekor qilish keyingi to{"'"}lov davridan kuchga kiradi.</p>
              <p>5.3. Joriy davr oxirigacha kanaldan foydalanish mumkin bo{"'"}lib qoladi.</p>
              <p>5.4. Bekor qilish uchun ilovadagi &quot;Obunani bekor qilish&quot; tugmasini bosish yetarli.</p>
            </div>
          </section>

          {/* Pul qaytarish */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-sm font-bold">6</span>
              Pulni qaytarish siyosati
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>6.1. Foydalanilgan davr uchun to{"'"}lov qaytarilmaydi.</p>
              <p>6.2. Obuna bekor qilinsa, joriy oylik davr tugaguncha xizmatdan foydalanish mumkin.</p>
              <p>6.3. Texnik nosozlik tufayli xizmat ko{"'"}rsatilmagan hollarda to{"'"}lov to{"'"}liq qaytariladi.</p>
            </div>
          </section>

          {/* Mualliflik huquqi */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-400 text-sm font-bold">7</span>
              Mualliflik huquqi
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>7.1. Kanaldagi barcha materiallar mualliflik huquqi bilan himoyalangan.</p>
              <p>7.2. Kontentni uchinchi shaxslarga tarqatish, nusxalash yoki qayta nashr qilish qat{"'"}iyan taqiqlanadi.</p>
              <p>7.3. Qoidabuzarlik aniqlansa, obuna ogohlantirushsiz bekor qilinadi va to{"'"}lov qaytarilmaydi.</p>
            </div>
          </section>

          {/* Shaxsiy ma'lumotlar */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 text-sm font-bold">8</span>
              Shaxsiy ma{"'"}lumotlar
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>8.1. Foydalanuvchining Telegram profil ma{"'"}lumotlari (ism, username, ID) xizmat ko{"'"}rsatish maqsadida saqlanadi.</p>
              <p>8.2. To{"'"}lov ma{"'"}lumotlari (karta raqamining oxirgi 4 raqami) faqat to{"'"}lov tarixini ko{"'"}rsatish uchun ishlatiladi.</p>
              <p>8.3. Shaxsiy ma{"'"}lumotlar uchinchi shaxslarga berilmaydi (to{"'"}lov tizimlari bundan mustasno).</p>
            </div>
          </section>

          {/* O'zgarishlar */}
          <section className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.08]">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 text-sm font-bold">9</span>
              O{"'"}zgarishlar kiritish
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>9.1. Xizmat ko{"'"}rsatuvchi istalgan vaqtda ushbu Oferta shartlarini yangilash huquqiga ega.</p>
              <p>9.2. O{"'"}zgarishlar haqida foydalanuvchilarga oldindan bot orqali xabar beriladi.</p>
              <p>9.3. O{"'"}zgarishlardan keyin xizmatdan foydalanishni davom ettirish yangi shartlarni qabul qilish hisoblanadi.</p>
            </div>
          </section>

          {/* Aloqa */}
          <section className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-400/15">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 text-sm font-bold">10</span>
              Bog{"'"}lanish
            </h2>
            <div className="text-indigo-200/60 text-sm leading-relaxed space-y-3">
              <p>Savollar yoki muammolar bo{"'"}lsa, quyidagi yo{"'"}llar orqali bog{"'"}lanishingiz mumkin:</p>
              <div className="space-y-2 mt-3">
                <a href="https://t.me/HilalEdu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2AABEE] to-[#229ED9] rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Telegram: @HilalEdu</p>
                  </div>
                </a>
                <a href="mailto:hilol.edu@gmail.com" className="flex items-center gap-3 bg-white/[0.07] rounded-xl p-3 border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Email: hilol.edu@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-4 pb-8">
            <p className="text-indigo-300/30 text-xs">© 2026 Hilal Edu. Barcha huquqlar himoyalangan.</p>
            <p className="text-indigo-300/20 text-[10px] mt-2">Obunani rasmiylashtirish orqali siz ushbu shartlarga rozilik bildirasiz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
