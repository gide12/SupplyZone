const fs = require('fs');
const path = require('path');

function replaceCoords(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip Lat/Lng State
  content = content.replace(
    /const \[profileLat, setProfileLat\].*/g,
    ''
  );
  content = content.replace(
    /const \[profileLng, setProfileLng\].*/g,
    'const [profileAddress, setProfileAddress] = useState(activeSupplier?.address || restaurant?.address || "");'
  );

  // Update save logic
  content = content.replace(
    /updateSupplierProfile\(profileName, parseFloat\(profileLat\), parseFloat\(profileLng\)\);/g,
    'updateSupplierProfile(profileName, activeSupplier.lat, activeSupplier.lng, profileAddress);'
  );
  content = content.replace(
    /updateRestaurantProfile\(restaurant.id, profileName, parseFloat\(profileLat\), parseFloat\(profileLng\)\);/g,
    'updateRestaurantProfile(restaurant.id, profileName, restaurant.lat, restaurant.lng, profileAddress);'
  );

  // Address form chunk
  const formHtml = `              <label className="block text-xl text-gray-700 mb-2 game-text">Address</label>
              <textarea
                value={profileAddress}
                onChange={(e) => setProfileAddress(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-[#00AA13] game-text text-lg"
                required
                rows={3}
              />`;

  if (filePath.includes('SupplierDashboard')) {
     content = content.replace(
       /<div className="grid grid-cols-2 gap-5">[\s\S]*?<\/div>(\s*<\/div>\s*<button type="submit")/gm,
       formHtml + '$1'
     );
  } else if (filePath.includes('RestaurantDashboard')) {
     content = content.replace(
       /<div className="grid grid-cols-2 gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<button type="submit"/gm,
       formHtml + '\n                </div>\n                <button type="submit"'
     );
  }

  // Hide the exact coords in Supplier map if they want? "not using Latitude or Longitude". 
  // Let's keep the map but just use the static lat lng from context and show the address.
  fs.writeFileSync(filePath, content);
}

const supDash = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
const restDash = path.join(process.cwd(), 'src/components/RestaurantDashboard.tsx');
const appContext = path.join(process.cwd(), 'src/store/AppContext.tsx');
const types = path.join(process.cwd(), 'src/types.ts');

try {
  replaceCoords(supDash);
  replaceCoords(restDash);
  console.log("Replaced UI");
} catch(e) { console.error(e) }

let typesContent = fs.readFileSync(types, 'utf8');
typesContent = typesContent.replace('lat: number;\n  lng: number;', 'lat: number;\n  lng: number;\n  address?: string;');
typesContent = typesContent.replace('lat: number;\n  lng: number;', 'lat: number;\n  lng: number;\n  address?: string;'); // Match twice for the 2 interfaces
fs.writeFileSync(types, typesContent);
console.log("Replaced types");

let appC = fs.readFileSync(appContext, 'utf8');
appC = appC.replace(
  'updateRestaurantProfile: (id: string, name: string, lat: number, lng: number) => void;',
  'updateRestaurantProfile: (id: string, name: string, lat: number, lng: number, address?: string) => void;'
);
appC = appC.replace(
  'updateSupplierProfile: (id: string, name: string, lat: number, lng: number) => void;',
  'updateSupplierProfile: (id: string, name: string, lat: number, lng: number, address?: string) => void;'
);
appC = appC.replace(
  'const updateRestaurantProfile = (id: string, name: string, lat: number, lng: number) =>',
  'const updateRestaurantProfile = (id: string, name: string, lat: number, lng: number, address?: string) =>'
);
appC = appC.replace(
  'r.id === id ? { ...r, name, lat, lng } : r',
  'r.id === id ? { ...r, name, lat, lng, address } : r'
);
appC = appC.replace(
  'const updateSupplierProfile = (id: string, name: string, lat: number, lng: number) =>',
  'const updateSupplierProfile = (id: string, name: string, lat: number, lng: number, address?: string) =>'
);
appC = appC.replace(
  's.id === id ? { ...s, name, lat, lng } : s',
  's.id === id ? { ...s, name, lat, lng, address } : s'
);
appC = appC.replace(
  'setActiveSupplier(prev => ({ ...prev, name, lat, lng }));',
  'setActiveSupplier(prev => ({ ...prev, name, lat, lng, address }));'
);
fs.writeFileSync(appContext, appC);
console.log("Replaced Context");
