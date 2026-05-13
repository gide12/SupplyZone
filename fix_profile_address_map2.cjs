const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('src/components/RestaurantDashboard.tsx', 'utf8');

// Add Leaflet imports
if (!content.includes('react-leaflet')) {
    content = content.replace(
        'import { useAppContext } from "../store/AppContext";',
        `import { useAppContext } from "../store/AppContext";\nimport { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";\nimport L from "leaflet";`
    );
}

// Add DraggableMarker component and customIcon
if (!content.includes('LocationMarker')) {
    content = content.replace(
        'export function RestaurantDashboard() {',
        `// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
}

function LocationMarker({ position, setPosition }: { position: L.LatLngExpression, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>My Restaurant Location</Popup>
    </Marker>
  );
}

export function RestaurantDashboard() {`
    );
}

// Update profile components mapping to set Map bounds/center when Profile is displayed
let formOld = `<AddressAutocomplete 
                     value={profileAddress} 
                     onChange={(addr, lat, lng) => {
                        setProfileAddress(addr);
                        setProfileLat(lat);
                        setProfileLng(lng);
                     }}
                   />`;

let formNew = `<AddressAutocomplete 
                     value={profileAddress} 
                     onChange={(addr, lat, lng) => {
                        setProfileAddress(addr);
                        if (lat !== undefined && lng !== undefined) {
                          setProfileLat(lat);
                          setProfileLng(lng);
                        }
                     }}
                   />
                </div>
                <div className="h-64 mt-4 relative z-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                   <MapContainer center={[profileLat || -5.147, profileLng || 119.432]} zoom={14} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                         url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                         subdomains={['mt0','mt1','mt2','mt3']}
                         attribution="&copy; Google"
                      />
                      <MapUpdater center={[profileLat || -5.147, profileLng || 119.432]} zoom={14} />
                      <LocationMarker 
                         position={[profileLat || -5.147, profileLng || 119.432]} 
                         setPosition={(pos) => { setProfileLat(pos[0]); setProfileLng(pos[1]); }} 
                      />
                   </MapContainer>
                   <div className="absolute top-2 right-2 z-[400] bg-white p-2 text-xs rounded shadow game-text">
                      Click map to pick exact location
                   </div>`;

if (content.includes(formOld)) {
   content = content.replace(formOld, formNew);
}

fs.writeFileSync('src/components/RestaurantDashboard.tsx', content);
console.log("Added map to RestaurantDashboard form.");

