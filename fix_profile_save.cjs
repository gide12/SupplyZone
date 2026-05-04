const fs = require('fs');
const path = require('path');

function wrapSave(filePath, isSupplier) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove old handleProfileSave completely
  const regex = /const handleProfileSave = \(e: React\.FormEvent\) => \{[\s\S]*?alert\("Profile updated successfully!"\);\s*\};/m;
  
  let newSave = `const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    ${isSupplier ? 'let finalLat = activeSupplier.lat;\n    let finalLng = activeSupplier.lng;' : 'if (!restaurant) return;\n    let finalLat = restaurant.lat;\n    let finalLng = restaurant.lng;'}
    
    if (profileAddress) {
      try {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\$\{encodeURIComponent(profileAddress)}\`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
    
    ${isSupplier ? 'updateSupplierProfile(profileName, finalLat, finalLng, profileAddress);' : 'updateRestaurantProfile(restaurant.id, profileName, finalLat, finalLng, profileAddress);'}
    alert("Profile updated successfully with location!");
  };`;

  content = content.replace(regex, newSave);

  // Add address to map popup if it is supplier dashboard
  if (isSupplier) {
    content = content.replace(
      '<div className="font-semibold">{restaurant.name}</div>',
      '<div className="font-semibold">{restaurant.name}</div>\n                  {restaurant.address && <div className="text-[10px] text-gray-500 mt-1">{restaurant.address}</div>}'
    );
  }

  fs.writeFileSync(filePath, content);
}

wrapSave(path.join(process.cwd(), 'src/components/SupplierDashboard.tsx'), true);
wrapSave(path.join(process.cwd(), 'src/components/RestaurantDashboard.tsx'), false);
console.log("Updated handleProfileSaves");
