export const dictionary: Record<string, Record<"en" | "id", string>> = {
  "Restaurant": { en: "Restaurant", id: "Restoran" },
  "Supplier": { en: "Supplier", id: "Pemasok" },
  "Dashboard": { en: "Dashboard", id: "Dasbor" },
  "Menu": { en: "Menu", id: "Menu" },
  "Menu Manager": { en: "Menu Manager", id: "Pengelola Menu" },
  "Inventory": { en: "Inventory", id: "Inventaris" },
  "Profile": { en: "Profile", id: "Profil" },
  "Deals": { en: "Deals", id: "Kesepakatan" },
  "Marketplace Map": { en: "Marketplace Map", id: "Peta Pasar" },
  "Active Deals": { en: "Active Deals", id: "Kesepakatan Aktif" },
  "Total Revenue": { en: "Total Revenue", id: "Total Pendapatan" },
  "Current Value": { en: "Current Value", id: "Nilai Saat Ini" },
  "Items in Stock": { en: "Items in Stock", id: "Barang Tersedia" },
  "Unread Messages": { en: "Unread Messages", id: "Pesan Belum Dibaca" },
  "My Inventory": { en: "My Inventory", id: "Inventaris Saya" },
  "Supplier Portal": { en: "Supplier Portal", id: "Portal Pemasok" },
  "Restaurant Portal": { en: "Restaurant Portal", id: "Portal Restoran" },
  "Logged in as": { en: "Logged in as", id: "Masuk sebagai" },
  "Language": { en: "Language", id: "Bahasa" },
  "Switch to English": { en: "Switch to English", id: "Ganti ke Bahasa Inggris" },
  "Switch to Indonesian": { en: "Switch to Indonesian", id: "Ganti ke Bahasa Indonesia" }
};

export function translate(text: string, language: "en" | "id"): string {
  if (dictionary[text] && dictionary[text][language]) {
    return dictionary[text][language];
  }
  return text; // fallback to original string
}
