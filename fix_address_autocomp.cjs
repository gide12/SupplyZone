const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    const p = path.join(process.cwd(), filePath);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');
    
    // Add import
    const importStatement = `import { AddressAutocomplete } from "./AddressAutocomplete";\n`;
    if (!content.includes('AddressAutocomplete')) {
        content = content.replace('import { useAppContext }', `${importStatement}import { useAppContext }`);
    }

    if (filePath.includes('RestaurantDashboard')) {
        // Add profileLat / profileLng state
        if (!content.includes('profileLat')) {
            content = content.replace(
                'const [profileAddress, setProfileAddress] = useState(restaurant?.address || "");',
                `const [profileAddress, setProfileAddress] = useState(restaurant?.address || "");\n  const [profileLat, setProfileLat] = useState<number | undefined>(restaurant?.lat);\n  const [profileLng, setProfileLng] = useState<number | undefined>(restaurant?.lng);`
            );
        }

        const oldHandleSave = `  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    let finalLat = restaurant.lat;
    let finalLng = restaurant.lng;
    
    if (profileAddress) {
      try {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(profileAddress)}\`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
    
    updateRestaurantProfile(restaurant.id, profileName, finalLat, finalLng, profileAddress);
    alert("Profile updated successfully with location!");
  };`;
  
        const newHandleSave = `  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    
    // Use the lat/lng from autocomplete if available, otherwise fallback
    let finalLat = profileLat ?? restaurant.lat;
    let finalLng = profileLng ?? restaurant.lng;
    
    updateRestaurantProfile(restaurant.id, profileName, finalLat, finalLng, profileAddress);
    alert("Profile updated successfully with location!");
  };`;
  
        if (content.includes(oldHandleSave)) {
            content = content.replace(oldHandleSave, newHandleSave);
        }

        // Replace textarea
        const oldTextarea = `<textarea
                     value={profileAddress}
                     onChange={(e) => setProfileAddress(e.target.value)}
                     className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg border border-gray-200"
                     required
                     rows={3}
                   />`;
        
        const newTextarea = `<AddressAutocomplete 
                     value={profileAddress} 
                     onChange={(addr, lat, lng) => {
                        setProfileAddress(addr);
                        setProfileLat(lat);
                        setProfileLng(lng);
                     }}
                   />`;
        
        if (content.includes(oldTextarea)) {
           content = content.replace(oldTextarea, newTextarea);
        }
        
    } else if (filePath.includes('SupplierDashboard')) {
        if (!content.includes('profileLat')) {
            content = content.replace(
                'const [profileAddress, setProfileAddress] = useState(activeSupplier?.address || "");',
                `const [profileAddress, setProfileAddress] = useState(activeSupplier?.address || "");\n  const [profileLat, setProfileLat] = useState<number | undefined>(activeSupplier.lat);\n  const [profileLng, setProfileLng] = useState<number | undefined>(activeSupplier.lng);`
            );
        }

        const oldHandleSaveSup = `  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalLat = activeSupplier.lat;
    let finalLng = activeSupplier.lng;
    
    if (profileAddress) {
      try {
        const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(profileAddress)}\`);
        const data = await res.json();
        if (data && data.length > 0) {
          finalLat = parseFloat(data[0].lat);
          finalLng = parseFloat(data[0].lon);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }
    
    updateSupplierProfile(profileName, finalLat, finalLng, profileAddress);
    alert("Profile updated successfully with location!");
  };`;

        const newHandleSaveSup = `  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalLat = profileLat ?? activeSupplier.lat;
    let finalLng = profileLng ?? activeSupplier.lng;
    
    updateSupplierProfile(profileName, finalLat, finalLng, profileAddress);
    setMapCenter([finalLat, finalLng]);
    alert("Profile updated successfully with location!");
  };`;

        if (content.includes(oldHandleSaveSup)) {
           content = content.replace(oldHandleSaveSup, newHandleSaveSup);
        }

        const oldTextareaSup = `<textarea
               value={profileAddress}
               onChange={(e) => setProfileAddress(e.target.value)}
               className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg"
               required
               rows={3}
             />`;
             
        const newTextareaSup = `<AddressAutocomplete 
               value={profileAddress} 
               onChange={(addr, lat, lng) => {
                  setProfileAddress(addr);
                  setProfileLat(lat);
                  setProfileLng(lng);
               }}
             />`;
             
        if (content.includes(oldTextareaSup)) {
           content = content.replace(oldTextareaSup, newTextareaSup);
        }
    }
    
    fs.writeFileSync(p, content);
}

processFile('src/components/RestaurantDashboard.tsx');
processFile('src/components/SupplierDashboard.tsx');
console.log('AddressAutocomplete installed in dashboards.');
