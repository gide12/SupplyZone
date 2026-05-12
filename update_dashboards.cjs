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

replaceInFile('src/components/SupplierDashboard.tsx', [
    [/Menu & Market Deals/g, 'Tawaran Pasar & Menu'],
    [/Save Profile/g, 'Simpan Profil'],
    [/Logout/g, 'Keluar'],
    [/Inventory Manager/g, 'Pengelola Inventaris'],
    [/Active Deals:/g, 'Kesepakatan Aktif:'],
    [/Total Revenue:/g, 'Total Pendapatan:'],
    [/Recent Activity/g, 'Aktivitas Terbaru'],
    [/Mark On Delivery/g, 'Tandai Sedang Dikirim'],
    [/Accept Deal/g, 'Terima Kesepakatan'],
    [/Send Sample/g, 'Kirim Sampel'],
    [/Pending/g, 'Tertunda'],
    [/Accepted/g, 'Diterima'],
    [/Sample Requested/g, 'Diminta Sampel'],
    [/Sample Arrived/g, 'Sampel Tiba'],
    [/On Delivery/g, 'Sedang Dikirim'],
    [/Delivered/g, 'Terkirim'],
    [/Qty:/g, 'Jml:'],
    [/Category:/g, 'Kategori:'],
    [/Needs Supplier/g, 'Butuh Pemasok'],
    [/Looking for supplier\.\.\./g, 'Mencari pemasok...'],
    [/Offer/g, 'Tawaran'],
    [/Make Offer/g, 'Ajukan Tawaran']
]);

replaceInFile('src/components/RestaurantDashboard.tsx', [
    [/Save Profile/g, 'Simpan Profil'],
    [/Logout/g, 'Keluar'],
    [/Recent Activity/g, 'Aktivitas Terbaru'],
    [/Request Sample/g, 'Minta Sampel']
]);

replaceInFile('src/components/MenuManager.tsx', [
    [/Add Menu Item/g, 'Tambah Menu'],
    [/Item Name/g, 'Nama Menu'],
    [/Price \(Rp\)/g, 'Harga (Rp)'],
    [/Category/g, 'Kategori'],
    [/Cancel/g, 'Batal'],
    [/Save Item/g, 'Simpan Menu'],
    [/Edit Item/g, 'Edit Menu'],
    [/Remove/g, 'Hapus'],
    [/Needs/g, 'Butuh'],
    [/Available/g, 'Tersedia'],
    [/Looking for supplier\.\.\./g, 'Mencari pemasok...'],
    [/Sample Arrived/g, 'Sampel Tiba']
]);

console.log("Dashboards translated");
