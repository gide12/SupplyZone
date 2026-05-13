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

replaceInFile('src/store/AppContext.tsx', [
    [/lat: 51\.505/g, 'lat: -5.147665'],
    [/lng: -0\.09/g, 'lng: 119.432731'],
    [/lat: 51\.51,/g, 'lat: -5.15,'],
    [/lng: -0\.1,/g, 'lng: 119.44,'],
    [/lat: 51\.52,/g, 'lat: -5.13,'],
    [/lng: -0\.11,/g, 'lng: 119.45,'],
    [/lat: 51\.49,/g, 'lat: -5.16,'],
    [/lng: -0\.08,/g, 'lng: 119.42,'],
    [/lat: 51\.515,/g, 'lat: -5.14,'],
    [/lng: -0\.105,/g, 'lng: 119.43,'],
    ['51.505 + (Math.random() * 0.1 - 0.05)', '-5.147665 + (Math.random() * 0.1 - 0.05)'],
    ['-0.09 + (Math.random() * 0.1 - 0.05)', '119.432731 + (Math.random() * 0.1 - 0.05)']
]);

replaceInFile('src/components/SupplierDashboard.tsx', [
    ['const defaultCenter: [number, number] = [51.505, -0.09];', 'const defaultCenter: [number, number] = [-5.147665, 119.432731];'],
    ['selectedRestaurant.lat ?? 51.505', 'selectedRestaurant.lat ?? -5.147665'],
    ['selectedRestaurant.lng ?? -0.09', 'selectedRestaurant.lng ?? 119.432731'],
    ['const lat = restaurant.lat ?? 51.505;', 'const lat = restaurant.lat ?? -5.147665;'],
    ['const lng = restaurant.lng ?? -0.09;', 'const lng = restaurant.lng ?? 119.432731;']
]);

console.log("Locations updated to Makassar");
