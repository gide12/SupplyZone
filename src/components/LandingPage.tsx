import React, { useState } from "react";
import { Store, Truck, Check, Star, Globe, LogIn } from "lucide-react";
import { useAppContext } from "../store/AppContext";
import { AddressAutocomplete } from "./AddressAutocomplete";

export function LandingPage({ onComplete }: { onComplete: () => void }) {
  const { language, setLanguage, setCurrentUserMode, setActiveRestaurantId, setActiveSupplierId, restaurants, suppliers, addRestaurant, addSupplier } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<"restaurant" | "supplier" | null>(null);
  const [step, setStep] = useState<"role" | "register" | "subscription" | "login">("role");

  // Mock form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  
  const content = {
    en: {
      title: "Jalur",
      titleSpan: "Rasa",
      titleHub: "Hub",
      subtitle: "Connecting Indonesia's local farmers directly to your kitchen.",
      restPortalText: "Restaurant Partner",
      restPortalDesc: "Manage your menu, secure fresh supplies, and order seamlessly from verified local farmers.",
      suppPortalText: "Supplier Partner",
      suppPortalDesc: "Sell your harvest, get dynamic market pricing, and reach thousands of top restaurants.",
      registerAs: "Register as",
      restaurant: "Restaurant",
      supplier: "Supplier",
      bizName: "Business Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Business Address (Map Synced)",
      continueBtn: "Continue",
      backRole: "Back to role selection",
      subTitle: "Choose Your Plan",
      subDesc: "Unlock smarter insights, dynamic pricing, and unlimited connections.",
      basic: "Basic",
      pro: "Pro",
      ent: "Enterprise",
      mostPop: "Most Popular",
      selectBasic: "Select Basic",
      selectPro: "Select Pro",
      contactSales: "Contact Sales",
      custom: "Custom",
      featsBasic: ["Basic profile listing", "Local market search", "Up to 50 active items"],
      featsPro: ["Everything in Basic", "Smart Pricing AI", "Unlimited inventory", "Verified Partner badge"],
      featsEnt: ["API Access", "Dedicated account manager", "Multi-location support"],
      backReg: "Back to registration",
      langSwitch: "Switch to ID 🇮🇩",
      addrPlaceholder: "Search location on map...",
      alreadyRegistered: "Already registered? Login here",
      loginTitle: "Select Your Account",
      loginDesc: "Choose an existing account to continue.",
      loginAsRest: "Login as Restaurant",
      loginAsSupp: "Login as Supplier"
    },
    id: {
      title: "Jalur",
      titleSpan: "Rasa",
      titleHub: "Hub",
      subtitle: "Hubungkan dapur restoranmu langsung dengan petani dan pemasok lokal Nusantara.",
      restPortalText: "Mitra Resto",
      restPortalDesc: "Kelola menu, amankan pasokan bahan baku segar, dan pesan langsung dari supplier terpercaya.",
      suppPortalText: "Mitra Pemasok",
      suppPortalDesc: "Jual hasil panenmu, dapatkan harga pasar dinamis, dan jangkau ribuan resto top.",
      registerAs: "Daftar sebagai",
      restaurant: "Mitra Resto",
      supplier: "Mitra Pemasok",
      bizName: "Nama Usaha",
      email: "Alamat Email",
      phone: "Nomor Telepon",
      address: "Alamat Lengkap (Sesuai Peta)",
      continueBtn: "Lanjut",
      backRole: "Kembali ke pilihan mitra",
      subTitle: "Pilih Paket Usaha",
      subDesc: "Buka akses analitik cerdas, optimasi harga, dan koneksi tanpa batas.",
      basic: "Dasar",
      pro: "Pro",
      ent: "Enterprise",
      mostPop: "Paling Laris",
      selectBasic: "Pilih Dasar",
      selectPro: "Pilih Pro",
      contactSales: "Hubungi Sales",
      custom: "Kustom",
      featsBasic: ["Listing profil usaha", "Pencarian pasar lokal", "Hingga 50 jenis barang"],
      featsPro: ["Semua fitur Dasar", "Analisis Harga AI", "Inventaris tak terbatas", "Lencana Mitra Terverifikasi"],
      featsEnt: ["Akses API terintegrasi", "Manajer akun khusus", "Dukungan multi-cabang"],
      backReg: "Kembali ke registrasi",
      langSwitch: "Switch to EN 🇺🇸",
      addrPlaceholder: "Cari lokasi di peta...",
      alreadyRegistered: "Sudah terdaftar? Masuk di sini",
      loginTitle: "Pilih Akun Anda",
      loginDesc: "Pilih akun yang sudah terdaftar untuk melanjutkan.",
      loginAsRest: "Masuk sebagai Restoran",
      loginAsSupp: "Masuk sebagai Pemasok"
    }
  };
  
  const t = content[language] || content.en;

  const handleRoleSelect = (role: "restaurant" | "supplier") => {
    setSelectedRole(role);
    setStep("register");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setStep("subscription");
    }
  };

  const handleSubscribe = (plan: string) => {
    // Save to user profile
    alert(language === "id" ? `Berlangganan paket ${plan} berhasil!` : `Subscribed to ${plan} plan!`);
    
    // Use selected lat/lng or fallback
    const defaultLat = lat !== undefined ? lat : -5.147665 + (Math.random() * 0.1 - 0.05);
    const defaultLng = lng !== undefined ? lng : 119.432731 + (Math.random() * 0.1 - 0.05);

    if (selectedRole === "restaurant") {
      const newId = addRestaurant({
        name: name || "New Restaurant",
        lat: defaultLat,
        lng: defaultLng,
        address: address || ""
      });
      setActiveRestaurantId(newId);
    } else if (selectedRole === "supplier") {
      const newId = addSupplier({
        name: name || "New Supplier",
        lat: defaultLat,
        lng: defaultLng,
        address: address || ""
      });
      setActiveSupplierId(newId);
    }

    setCurrentUserMode(selectedRole || "restaurant");
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      <button 
        onClick={() => setLanguage(language === "en" ? "id" : "en")}
        className="absolute top-6 right-6 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-900 shadow-sm font-bold text-sm z-50"
      >
        <Globe className="w-4 h-4 text-[#00AA13]" /> {t.langSwitch}
      </button>

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {step === "role" && (
          <div className="p-8 md:p-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">{t.title} <span className="text-[#00AA13]">{t.titleSpan}</span> {t.titleHub}</h1>
            <p className="text-xl text-gray-500 mb-12">{t.subtitle}</p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <button 
                onClick={() => handleRoleSelect("restaurant")}
                className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-[#EE2737] hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
              >
                <div className="w-24 h-24 bg-[#EE2737]/10 text-[#EE2737] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Store className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">{t.restPortalText}</h2>
                <p className="text-gray-500 text-center font-medium leading-relaxed">{t.restPortalDesc}</p>
              </button>

              <button 
                onClick={() => handleRoleSelect("supplier")}
                className="group relative flex flex-col items-center p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-[#00AA13] hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
              >
                <div className="w-24 h-24 bg-[#00AA13]/10 text-[#00AA13] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Truck className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">{t.suppPortalText}</h2>
                <p className="text-gray-500 text-center font-medium leading-relaxed">{t.suppPortalDesc}</p>
              </button>
            </div>
            
            <div className="mt-12 text-center">
              <button 
                onClick={() => setStep("login")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold transition-colors"
               >
                <LogIn className="w-5 h-5" />
                {t.alreadyRegistered}
              </button>
            </div>
          </div>
        )}

        {step === "login" && (
          <div className="p-8 md:p-12 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-black text-gray-900 mb-3 text-center">{t.loginTitle}</h2>
            <p className="text-gray-500 text-center mb-8 font-medium">{t.loginDesc}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#EE2737]" /> {t.restaurant}
                </h3>
                <div className="space-y-3">
                  {restaurants.map(r => (
                    <button 
                      key={r.id}
                      onClick={() => {
                        setActiveRestaurantId(r.id);
                        setCurrentUserMode("restaurant");
                        onComplete();
                      }}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#EE2737]/10 hover:text-[#EE2737] border border-gray-200 rounded-xl font-medium transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{r.name}</span>
                      <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {restaurants.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No restaurants found.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#00AA13]" /> {t.supplier}
                </h3>
                <div className="space-y-3">
                  {suppliers.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => {
                        setActiveSupplierId(s.id);
                        setCurrentUserMode("supplier");
                        onComplete();
                      }}
                      className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#00AA13]/10 hover:text-[#00AA13] border border-gray-200 rounded-xl font-medium transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{s.name}</span>
                      <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {suppliers.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No suppliers found.</p>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setStep("role")}
              className="mt-10 w-full text-center text-sm text-gray-500 hover:text-gray-900 font-bold transition-colors"
            >
              ← {t.backRole}
            </button>
          </div>
        )}

        {step === "register" && (
          <div className="p-8 md:p-12 max-w-lg mx-auto w-full">
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
              {t.registerAs} {selectedRole === "restaurant" ? t.restaurant : t.supplier}
            </h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.bizName}</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00AA13]/30 focus:border-[#00AA13] transition-all"
                  placeholder="e.g. Warung Budi"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.email}</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00AA13]/30 focus:border-[#00AA13] transition-all"
                  placeholder="hello@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.phone}</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#00AA13]/30 focus:border-[#00AA13] transition-all"
                  placeholder="+62 812 3456 7890"
                />
              </div>
              
              <div className="relative z-50">
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.address}</label>
                <div className="relative">
                  <AddressAutocomplete 
                    value={address}
                    onChange={(val, newLat, newLng) => {
                      setAddress(val);
                      setLat(newLat);
                      setLng(newLng);
                    }}
                    placeholder={t.addrPlaceholder}
                    required
                    lang={language}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 text-lg shadow-lg hover:-translate-y-0.5 transition-all ${selectedRole === "restaurant" ? "bg-[#EE2737] hover:bg-[#D52331]" : "bg-[#00AA13] hover:bg-[#009110]"}`}
              >
                {t.continueBtn}
              </button>
            </form>
            <button 
              onClick={() => setStep("role")}
              className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-900 font-bold transition-colors"
            >
              ← {t.backRole}
            </button>
          </div>
        )}

        {step === "subscription" && (
          <div className="p-8 md:p-12 bg-gray-50/50">
            <h2 className="text-3xl font-black text-gray-900 mb-3 text-center">{t.subTitle}</h2>
            <p className="text-gray-500 text-center mb-10 font-medium">{t.subDesc}</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Basic */}
              <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all bg-white flex flex-col">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.basic}</h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-8">Rp 0<span className="text-base font-medium text-gray-500"> / mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.featsBasic.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                      <Check className="w-5 h-5 text-[#00AA13] shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(t.basic)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">{t.selectBasic}</button>
              </div>

              {/* Pro */}
              <div className="border-2 border-[#00AA13] rounded-3xl p-8 shadow-2xl relative bg-white flex flex-col md:scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00AA13] text-white px-4 py-1.5 text-xs font-black rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                  <Star className="w-3.5 h-3.5 fill-white" /> {t.mostPop}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.pro}</h3>
                <div className="text-4xl font-extrabold text-[#00AA13] mb-8">Rp 299k<span className="text-base font-medium text-gray-500"> / mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.featsPro.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                      <Check className="w-5 h-5 text-[#00AA13] shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(t.pro)} className="w-full py-3 bg-[#00AA13] hover:bg-[#009110] text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5">{t.selectPro}</button>
              </div>

              {/* Enterprise */}
              <div className="border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all bg-white flex flex-col">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.ent}</h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-8">{t.custom}</div>
                <ul className="space-y-4 mb-8 flex-1">
                  {t.featsEnt.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                      <Check className="w-5 h-5 text-[#00AA13] shrink-0" /> {feat}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleSubscribe(t.ent)} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors">{t.contactSales}</button>
              </div>
            </div>
            <button 
              onClick={() => setStep("register")}
              className="mt-10 w-full text-center text-sm text-gray-500 hover:text-gray-900 font-bold transition-colors"
            >
              ← {t.backReg}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
