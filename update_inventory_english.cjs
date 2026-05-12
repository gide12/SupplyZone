const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    const p = path.join(process.cwd(), filePath);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.replace(search, replace);
    }

    fs.writeFileSync(p, content);
}

replaceInFile('src/components/RestaurantInventory.tsx', [
    [/Inventory Management/g, 'Manajemen Inventaris'],
    [/Add Ingredient/g, 'Tambah Bahan'],
    [/Ingredient Name/g, 'Nama Bahan'],
    [/Space Used \(sq ft\)/g, 'Kapasitas (sq ft)'],
    [/Expiration Date/g, 'Tanggal Kedaluwarsa'],
    [/Add to Inventory/g, 'Masuk ke Inventaris'],
    [/OR AI AUTO-IMPORT/g, 'ATAU AI AUTO-IMPORT'],
    [/Photo\/Receipt/g, 'Foto/Struk'],
    [/Upload CSV\/Excel/g, 'Unggah CSV/Excel'],
    [/Current Stock/g, 'Stok Saat Ini'],
    [/Total Space:/g, 'Total Kapasitas:'],
    [/No inventory items\. Add some above\./g, 'Belum ada barang di inventaris. Silakan tambah.'],
    [/of Used Cap/g, 'Kapasitas Dipakai'],
    [/AI Efficiency Engine/g, 'Mesin Efisiensi AI'],
    [/Run AI analysis to evaluate space usage, effectiveness in supporting dominant products \(e\.g\. Avocado Toast\), and get expiration warnings\./g, 'Jalankan analisis AI untuk mengevaluasi kapasitas ruang dan peringatan kedaluwarsa.'],
    [/Analyzing Matrix\.\.\./g, 'Menganalisis...'],
    [/Hitung Kapasitas/g, 'Hitung Kapasitas'],
    [/Cek Cuaca/g, 'Cek Cuaca'],
    [/Efficiency/g, 'Efisiensi'],
    [/Effectiveness/g, 'Efektivitas'],
    [/Capacity Status/g, 'Status Kapasitas'],
    [/Expiration Reminders/g, 'Pengingat Kedaluwarsa'],
    [/Dominant Products Sync/g, 'Analisis Produk Utama'],
    [/SALES DATA/g, 'DATA PENJUALAN'],
    [/AI Recommendation/g, 'Rekomendasi AI'],
    [/Menu Discount Recommendations/g, 'Rekomendasi Diskon Menu'],
    [/INCREASE ORDERS/g, 'TINGKATKAN PESANAN'],
    [/OFF/g, 'DISKON'],
    // Modify prompt to respond in Indonesian
    [/Calculate:\n        1\. A score for Space Efficiency \(0-100\)\./, 'Calculate (Please output all text responses in Indonesian Language):\n        1. A score for Space Efficiency (0-100).']
]);

replaceInFile('src/components/SupplierInventory.tsx', [
        [/Inventory Management/g, 'Manajemen Inventaris'],
    [/Add Item/g, 'Tambah Barang'],
    [/Item Name/g, 'Nama Barang'],
    [/Base Price \(Rp\)/g, 'Harga Pokok (Rp)'],
    [/Base Price/g, 'Harga Pokok'],
    [/Unit/g, 'Satuan'],
    [/Space Used \(sq ft\)/g, 'Kapasitas (sq ft)'],
    [/Expiration Date/g, 'Tanggal Kedaluwarsa'],
    [/Add to Inventory/g, 'Masuk ke Inventaris'],
    [/OR AI AUTO-IMPORT/g, 'ATAU AI AUTO-IMPORT'],
    [/Photo\/Receipt/g, 'Foto/Struk'],
    [/Upload CSV\/Excel/g, 'Unggah CSV/Excel'],
    [/Current Stock/g, 'Stok Saat Ini'],
    [/Total Space:/g, 'Total Kapasitas:'],
    [/No inventory items/g, 'Belum ada barang di inventaris'],
    [/of Used Cap/g, 'Kapasitas Dipakai'],
    [/AI Efficiency Engine/g, 'Mesin Efisiensi AI'],
    [/Run AI analysis to evaluate space usage/g, 'Jalankan analisis AI untuk mengevaluasi kapasitas ruang'],
    [/Analyzing Matrix\.\.\./g, 'Menganalisis...'],
    [/Efficiency/g, 'Efisiensi'],
    [/Effectiveness/g, 'Efektivitas'],
    [/Capacity Status/g, 'Status Kapasitas'],
    [/Expiration Reminders/g, 'Pengingat Kedaluwarsa'],
    [/Dominant Products Sync/g, 'Analisis Produk Utama'],
    [/SALES DATA/g, 'DATA PENJUALAN'],
    [/AI Recommendation/g, 'Rekomendasi AI'],
    [/Discount Recommendations/g, 'Rekomendasi Diskon'],
    [/INCREASE SALES/g, 'TINGKATKAN PENJUALAN'],
    [/OFF/g, 'DISKON'],
    [/Calculate:\n        1\. A score for Space Efficiency \(0-100\)\./, 'Calculate (Please output all text responses in Indonesian Language):\n        1. A score for Space Efficiency (0-100).']
]);

console.log('Done inventory translation');
