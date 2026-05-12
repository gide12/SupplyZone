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

// 1. AIMarginPredictor.tsx
replaceInFile('src/components/AIMarginPredictor.tsx', [
    [/Product Name/, 'Nama Produk'],
    [/Avocado Toast/g, 'Roti Alpukat'],
    [/Quantity \(e\.g\. 100\)/, 'Kuantitas (cth. 100)'],
    [/Quantity Req./, 'Jml. Butuh'],
    [/Est. Revenue \(Rp\)/, 'Est. Penjualan (Rp)'],
    [/Target Margin \(%\)/, 'Target Margin (%)'],
    [/Ingredients List/, 'Daftar Bahan'],
    [/Add Ingredient/, 'Tambah Bahan'],
    [/Ingredient Name/, 'Nama Bahan'],
    [/Price \(Rp\)/, 'Harga (Rp)'],
    [/Calculate/g, 'Hitung'],
    [/Fixed Price\?/, 'Harga Tetap?'],
    [/Run Margin AI/, 'Jalankan Margin AI'],
    [/Calculating Models\.\.\./, 'Menghitung Model...'],
    [/Financial Projection Summary/, 'Ringkasan Proyeksi Keuangan'],
    [/ESTIMATED REVENUE/, 'ESTIMASI PENJUALAN'],
    [/Less: Max Allowed COGS/, 'Dikurangi: Max HPP (Beban)'],
    [/Target Profit/, 'Target Profit'],
    [/AI Analysis/, 'Analisis AI'],
    [/AI Margin Calculator/, 'Kalkulator Margin AI'],
    [/Dynamic Pricing & Target Margins/, 'Harga Dinamis & Target Margin'],
    [/Failed to analyze margin. Check the console for details./, 'Gagal menganalisis margin. Cek konsol.']
]);

// 2. PredictSupplyModal.tsx
replaceInFile('src/components/PredictSupplyModal.tsx', [
    [/AI Supply Predictor/, 'Prediktor Pasokan AI'],
    [/Estimate your monthly needs/, 'Estimasi kebutuhan bulanan anda'],
    [/Expected Customers \(Per Month\)/, 'Ekspektasi Pelanggan (Per Bulan)'],
    [/Our AI will analyze your current menu \(\{menuItems\.length\} items\) and estimate the required stock./, 'AI kami akan menganalisis menu saat ini ({menuItems.length} menu) dan mengestimasi stok yang dibutuhkan.'],
    [/Predicting\.\.\./, 'Memprediksi...'],
    [/"Predict"/, '"Prediksi"'],
    [/Predicted Needs/, 'Prediksi Kebutuhan'],
    [/Capacity Utilization/, 'Pemanfaatan Kapasitas'],
    [/Please add some items to your menu first to get predictions./, 'Silakan tambahkan menu terlebih dahulu.'],
    [/Failed to generate predictions. Check the console for more details./, 'Gagal memprediksi pasokan. Cek konsol.'],
    [/I run a restaurant and expect \$\{customers\} customers this month. Given my menu items and current inventory, predict the supply quantity I need to order for each item to serve them. Also include capacity usage percentage for each item ordered \(relative to space used\) and alert regarding expiring\/expired items so I never run out of stock or have out of expired ingredients./, 'Saya menjalankan restoran dan menargetkan ${customers} pelanggan bulan ini. Berdasarkan menu dan inventaris saya, prediksi kuantitas pasokan yang harus saya pesan. Sertakan juga persentase penggunaan kapasitas dan peringatan kedaluwarsa dalam bahasa gaul / Indonesia santai.'],
    [/The name of the menu item or ingredient/, 'Nama menu atau bahan'],
    [/The predicted quantity to order \(e.g., '150 lbs', '20 packs'\)/, 'Kuantitas prediksi yang dibutuhkan'],
    [/Percentage of inventory capacity this order will take up \(0-100\)/, 'Persentase kapasitas inventaris'],
    [/Alert text regarding expiration, e.g. 'Expires in 3 days' or 'OK'/, 'Teks peringatan kedaluwarsa'],
    [/A short reason for the estimate/, 'Alasan singkat estismasi (bhs Indonesia)']
]);

// 3. FuelEstimateCard.tsx
replaceInFile('src/components/FuelEstimateCard.tsx', [
    [/Delivery Logistics/, 'Logistik Pengiriman'],
    [/Estimate with AI/, 'Estimasi AI'],
    [/Estimating\.\.\./, 'Mengestimasi...'],
    [/Distance/, 'Jarak'],
    [/Fuel/, 'Bensin'],
    [/Cost/, 'Biaya'],
    [/Failed to estimate fuel consumption./, 'Gagal mengestimasi bahan bakar.'],
    [/Please provide the response in Indonesian/, 'Tolong berikan respons dalam bahasa Indonesia']
]);

// 4. WeatherForecastModal.tsx
replaceInFile('src/components/WeatherForecastModal.tsx', [
    [/Inventory is empty\. Please add items to check prices\./, 'Inventaris kosong. Silakan tambah barang untuk mengecek harga.'],
    [/Failed to generate forecast\./, 'Gagal mengambil prediksi cuaca.'],
    [/Weather-based Supply Chain Predictor/, 'Prediktor Rantai Pasok Cuaca'],
    [/Loading\.\.\./, 'Memuat...'],
    [/Forecasting Supply AI/, 'Prakiraan Supply AI'],
    [/Weather impact:/, 'Dampak Cuaca:'],
    [/output an array of objects for each ingredient discussing the weather condition, harvest impact, price change forecast, and business recommendation./, 'Keluarkan hasilnya sebagai JSON arrray berisikan rekomendasi bisnis menggunakan bahasa Indonesia.']
]);

// 5. Check if we need to modify AI language instruction for Fuel Estimate
let fuelFile = fs.readFileSync(path.join(process.cwd(), 'src/components/FuelEstimateCard.tsx'), 'utf8');
if (!fuelFile.includes('Please provide all string values in Indonesian')) {
    fuelFile = fuelFile.replace('1. Driving distance.', '1. Driving distance.\nNote: Please provide all text values (distance, fuelUsed, estimatedCost, routeNotes) in Indonesian (Bahasa Indonesia).');
    fs.writeFileSync(path.join(process.cwd(), 'src/components/FuelEstimateCard.tsx'), fuelFile);
}

// 6. Check common deal status in MenuManager and SupplierDashboard ("Accepted", "On Delivery", "Delivered")
// For statuses we might just want to change their display string, or leave them since they might be used as logic keys.

console.log("English UI texts replaced with Indonesian");
