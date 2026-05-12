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
    [/Cancel/g, 'Batal']
]);

replaceInFile('src/components/MenuManager.tsx', [
    [/Save Changes/g, 'Simpan Perubahan']
]);

replaceInFile('src/components/EstimateExpirationModal.tsx', [
    [/AI Expiration Estimator/g, 'Estimator Kedaluwarsa AI'],
    [/Calculating\.\.\./g, 'Menghitung...'],
    [/Generating Estimate/g, 'Mengestimasi'],
    [/Select and apply/g, 'Pilih dan terapkan'],
    [/Room Temp/g, 'Suhu Ruangan'],
    [/Chiller/g, 'Kulkas'],
    [/Freezer/g, 'Pembeku'],
    [/How do you plan to store this item\?/g, 'Bagaimana Anda akan menyimpan barang ini?'],
    [/Failed to estimate expiration\./g, 'Gagal mengestimasi kedaluwarsa.']
]);

// Ensure i18n has any missing entries
let i18n = fs.readFileSync(path.join(process.cwd(), 'src/lib/i18n.ts'), 'utf8');
// Let's just make sure "Deals" is not breaking anything. I18n already translates things correctly.

console.log("Fixed extra English parts");
