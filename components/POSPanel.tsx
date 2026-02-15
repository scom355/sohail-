
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { CartItem } from '../types';

type Language = 'en' | 'ur';

const translations = {
  en: {
    terminalTitle: "CARREFOUR DIGITAL TERMINAL",
    addToBasket: "Add to Basket",
    scanOrType: "Scan or Type",
    scanDesc: "Upload product photo or type the name.",
    aiSearch: "AI Search",
    aiSearchDesc: "Our AI finds real Carrefour prices.",
    addBill: "Add to Bill",
    addBillDesc: "Items appear on your live receipt.",
    placeholder: "Ex: 'Nescafé Gold' or 'Organic Banana'...",
    checkBtn: "Check & Add Item",
    identifying: "AI Identifying...",
    receiptTitle: "DIGITAL RECEIPT",
    items: "ITEMS",
    subtotal: "SUBTOTAL (VAT EXCL.)",
    vat: "VAT ESTIMATE (5%)",
    total: "TOTAL",
    payBtn: "Pay Now",
    emptyCart: "Ready to scan items. The digital receipt will appear here.",
    shortcuts: "Hot Inventory Shortcuts",
    error: "AI could not identify this product. Try typing the name."
  },
  ur: {
    terminalTitle: "کیرفور ڈیجیٹل ٹرمینل",
    addToBasket: "ٹوکری میں شامل کریں",
    scanOrType: "اسکین یا ٹائپ کریں",
    scanDesc: "پروڈکٹ کی تصویر اپ لوڈ کریں یا نام لکھیں۔",
    aiSearch: "AI تلاش",
    aiSearchDesc: "ہمارا AI کیرفور کی اصل قیمتیں تلاش کرتا ہے۔",
    addBill: "بل میں شامل کریں",
    addBillDesc: "آئٹمز آپ کی لائیو رسید پر نظر آئیں گے۔",
    placeholder: "مثال: 'نسکیفے گولڈ' یا 'نامیاتی کیلا'...",
    checkBtn: "آئٹم چیک کریں اور شامل کریں",
    identifying: "AI شناخت کر رہا ہے...",
    receiptTitle: "ڈیجیٹل رسید",
    items: "آئٹمز",
    subtotal: "کل رقم (بغیر ٹیکس)",
    vat: "ٹیکس کا تخمینہ (5%)",
    total: "کل رقم",
    payBtn: "ادائیگی کریں",
    emptyCart: "آئٹمز اسکین کرنے کے لیے تیار ہیں۔ ڈیجیٹل رسید یہاں نظر آئے گی۔",
    shortcuts: "مشہور اشیاء",
    error: "AI اس پروڈکٹ کو نہیں پہچان سکا۔ براہ کرم نام ٹائپ کریں۔"
  }
};

const Step: React.FC<{ number: string; title: string; desc: string; lang: Language }> = ({ number, title, desc, lang }) => (
  <div className={`bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex items-start gap-4 shadow-lg ${lang === 'ur' ? 'flex-row-reverse text-right' : 'text-left'}`}>
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
      {number}
    </div>
    <div>
      <h4 className="text-sm font-bold text-white mb-0.5">{title}</h4>
      <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
    </div>
  </div>
);

const POSPanel: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processProduct = async () => {
    if (!searchQuery && !previewImage) return;
    setLoading(true);
    try {
      const base64 = previewImage?.split(',')[1];
      const result = await geminiService.identifyProduct(searchQuery, base64);
      
      if (result) {
        const newItem: CartItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: result.name,
          price: result.price,
          quantity: 1,
          category: result.category
        };
        setCart(prev => [newItem, ...prev]);
        setSearchQuery('');
        setPreviewImage(null);
      }
    } catch (err) {
      console.error(err);
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vat = subtotal * 0.05; 
  const total = subtotal + vat;

  return (
    <div className={`flex h-full flex-col lg:flex-row gap-8 animate-in fade-in duration-700 ${lang === 'ur' ? 'lg:flex-row-reverse' : ''}`}>
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          {lang === 'en' ? 'Urdu (اردو)' : 'English'}
        </button>
      </div>

      {/* Left side: Terminal Input */}
      <div className="flex-[1.5] flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Step number="1" title={t.scanOrType} desc={t.scanDesc} lang={lang} />
           <Step number="2" title={t.aiSearch} desc={t.aiSearchDesc} lang={lang} />
           <Step number="3" title={t.addBill} desc={t.addBillDesc} lang={lang} />
        </div>

        <div className={`bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
          <h2 className={`text-2xl font-bold text-white mb-2 flex items-center gap-3 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
            <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
            {t.addToBasket}
          </h2>
          <p className="text-gray-400 text-sm mb-8">AI powered by Gemini 3 Flash</p>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                dir={lang === 'ur' ? 'rtl' : 'ltr'}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.placeholder}
                onKeyDown={(e) => e.key === 'Enter' && processProduct()}
                className="w-full bg-[#1a1a1a] border-2 border-white/5 rounded-2xl py-5 pl-6 pr-14 text-white text-lg focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`absolute ${lang === 'ur' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-2 bg-blue-600/10 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                </svg>
              </button>
              <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleImageUpload} />
            </div>

            <button
              onClick={processProduct}
              disabled={loading || (!searchQuery && !previewImage)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t.identifying}</span>
                </>
              ) : (
                <span>{t.checkBtn}</span>
              )}
            </button>
          </div>
        </div>

        <div className={`bg-[#111] border border-white/5 rounded-3xl p-6 ${lang === 'ur' ? 'text-right' : 'text-left'}`}>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">{t.shortcuts}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {['Milk', 'Arabic Bread', 'Local Eggs', 'Avocado'].map(item => (
               <button 
                 key={item} 
                 onClick={() => setSearchQuery(item)}
                 className="p-4 bg-[#1a1a1a] border border-white/5 rounded-2xl text-center text-sm font-semibold hover:border-blue-500/50 transition-all active:scale-95"
               >
                 {item}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Right side: Live Receipt */}
      <div className="flex-1 flex flex-col bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[500px]">
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 flex justify-between items-start">
          <div className={lang === 'ur' ? 'text-right' : 'text-left'}>
            <h2 className="text-xl font-black text-white italic tracking-tighter">CARREFOUR</h2>
            <p className="text-[10px] text-blue-200 font-bold uppercase">{t.receiptTitle}</p>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
            {cart.length} {t.items}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5 backdrop-blur-sm">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-700 text-center p-8 space-y-4">
              <p className="text-sm font-medium">{t.emptyCart}</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={`flex justify-between items-center group animate-in slide-in-from-right-4 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex items-center gap-3 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className={lang === 'ur' ? 'text-right' : 'text-left'}>
                    <h4 className="text-sm font-bold text-gray-100">{item.name}</h4>
                    <p className="text-[10px] text-gray-500 font-mono">ID: {item.id.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-blue-400">{item.price.toFixed(2)} AED</span>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-600 hover:text-red-500 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-black/60 border-t border-white/10 space-y-4">
          <div className="space-y-2">
            <div className={`flex justify-between text-xs font-bold text-gray-500 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
              <span>{t.subtotal}</span>
              <span className="font-mono">{subtotal.toFixed(2)} AED</span>
            </div>
            <div className={`flex justify-between text-xs font-bold text-gray-500 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
              <span>{t.vat}</span>
              <span className="font-mono">{vat.toFixed(2)} AED</span>
            </div>
          </div>
          
          <div className={`flex justify-between text-2xl font-black text-white pt-4 border-t-2 border-dashed border-white/10 ${lang === 'ur' ? 'flex-row-reverse' : ''}`}>
            <span className="tracking-tighter">{t.total}</span>
            <span className="text-blue-500 font-mono tracking-tighter">{total.toFixed(2)} AED</span>
          </div>

          <button
            disabled={cart.length === 0}
            className="w-full mt-6 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl shadow-2xl disabled:opacity-30 uppercase tracking-widest"
          >
            {t.payBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSPanel;
