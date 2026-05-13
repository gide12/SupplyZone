const fs = require('fs');
const path = require('path');

let appContext = fs.readFileSync('src/store/AppContext.tsx', 'utf8');

// Update interface
appContext = appContext.replace(
    '  activeRestaurantId: string | null;',
    '  activeRestaurantId: string | null;\n  setActiveRestaurantId: (id: string) => void;'
);
appContext = appContext.replace(
    '  activeSupplier: SupplierProfile;',
    '  activeSupplier: SupplierProfile;\n  setActiveSupplierId: (id: string) => void;'
);

// Update implementation
appContext = appContext.replace(
    'const [activeRestaurantId] = useState<string>("r-1");',
    `const [activeRestaurantId, setActiveRestaurantId] = useState<string>(() => {
    const saved = localStorage.getItem("supplymap_activeRestaurantId");
    return saved || "r-1";
  });\n  
  const [activeSupplierId, setActiveSupplierId] = useState<string>(() => {
    const saved = localStorage.getItem("supplymap_activeSupplierId");
    return saved || defaultSuppliers[0].id;
  });\n  
  useEffect(() => {
    localStorage.setItem("supplymap_activeRestaurantId", activeRestaurantId);
  }, [activeRestaurantId]);\n
  useEffect(() => {
    localStorage.setItem("supplymap_activeSupplierId", activeSupplierId);
  }, [activeSupplierId]);`
);

appContext = appContext.replace(
    'const [activeSupplier, setActiveSupplier] = useState<SupplierProfile>(() => {\n    const saved = localStorage.getItem("supplymap_supplier");\n    // Default to the first supplier in the defaultSuppliers list if no saved profile is found.\n    // Ensure that it has an inventory property.\n    return saved ? JSON.parse(saved) : defaultSuppliers[0];\n  });',
    '// activeSupplier is now derived\n  const activeSupplier = suppliers.find(s => s.id === activeSupplierId) || suppliers[0];'
);

appContext = appContext.replace(
    `  const updateSupplierProfile = (id: string, name: string, lat: number, lng: number, address?: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, name, lat, lng, address } : s));
    if (activeSupplier.id === id) {
      setActiveSupplier(prev => ({ ...prev, name, lat, lng, address }));
    }
  };`,
    `  const updateSupplierProfile = (id: string, name: string, lat: number, lng: number, address?: string) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, name, lat, lng, address } : s));
  };`
);

appContext = appContext.replace(
    `  const updateSupplierInventory = (id: string, inventory: SupplierInventoryItem[]) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, inventory } : s));
    if (activeSupplier.id === id) {
      setActiveSupplier(prev => ({ ...prev, inventory }));
    }
  };`,
    `  const updateSupplierInventory = (id: string, inventory: SupplierInventoryItem[]) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, inventory } : s));
  };`
);

appContext = appContext.replace(
    'activeRestaurantId,',
    'activeRestaurantId,\n      setActiveRestaurantId,'
);
appContext = appContext.replace(
    'activeSupplier,',
    'activeSupplier,\n      setActiveSupplierId,'
);

fs.writeFileSync('src/store/AppContext.tsx', appContext);

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace(
    '  const { currentUserMode, setCurrentUserMode, messages, activeRestaurantId, activeSupplier, deals, language, setLanguage } = useAppContext();',
    '  const { currentUserMode, setCurrentUserMode, messages, activeRestaurantId, activeSupplier, deals, language, setLanguage, restaurants, suppliers, setActiveRestaurantId, setActiveSupplierId } = useAppContext();'
);

const oldRoleSwitcherBtns = `<button
        onClick={() => setCurrentUserMode("restaurant")}
        className={\`flex items-center gap-2 px-4 py-2 text-sm game-btn relative \${
          currentUserMode === "restaurant" 
            ? "bg-[#EE2737] text-white border-[#EE2737] font-bold shadow-sm" 
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
        }\`}
      >
        <Store className="w-4 h-4" />
        <span className="hidden sm:inline game-text">{translate("Restaurant Portal", language)}</span>
        {unreadRestaurant > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
            {unreadRestaurant}
          </span>
        )}
      </button>
      <button
        onClick={() => setCurrentUserMode("supplier")}
        className={\`flex items-center gap-2 px-4 py-2 text-sm game-btn relative \${
          currentUserMode === "supplier" 
            ? "bg-[#00AA13] text-white border-[#00AA13] font-bold shadow-sm" 
            : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
        }\`}
      >
        <Truck className="w-4 h-4" />
        <span className="hidden sm:inline game-text">{translate("Supplier Portal", language)}</span>
        {unreadSupplier > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
            {unreadSupplier}
          </span>
        )}
      </button>`;

const newRoleSwitcherBtns = `<div className="flex flex-col gap-1 items-end">
        <select 
          value={activeRestaurantId || ""} 
          onChange={(e) => {
            setActiveRestaurantId(e.target.value);
            setCurrentUserMode("restaurant");
          }}
          className="text-xs p-1 border rounded bg-white max-w-[120px] truncate"
        >
          {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button
          onClick={() => setCurrentUserMode("restaurant")}
          className={\`flex items-center gap-2 px-4 py-2 text-sm game-btn relative \${
            currentUserMode === "restaurant" 
              ? "bg-[#EE2737] text-white border-[#EE2737] font-bold shadow-sm" 
              : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
          }\`}
        >
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline game-text">{translate("Restaurant Portal", language)}</span>
          {unreadRestaurant > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {unreadRestaurant}
            </span>
          )}
        </button>
      </div>
      <div className="flex flex-col gap-1 items-end">
        <select 
          value={activeSupplier?.id || ""} 
          onChange={(e) => {
            setActiveSupplierId(e.target.value);
            setCurrentUserMode("supplier");
          }}
          className="text-xs p-1 border rounded bg-white max-w-[120px] truncate"
        >
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button
          onClick={() => setCurrentUserMode("supplier")}
          className={\`flex items-center gap-2 px-4 py-2 text-sm game-btn relative \${
            currentUserMode === "supplier" 
              ? "bg-[#00AA13] text-white border-[#00AA13] font-bold shadow-sm" 
              : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
            }\`}
          >
          <Truck className="w-4 h-4" />
          <span className="hidden sm:inline game-text">{translate("Supplier Portal", language)}</span>
          {unreadSupplier > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#EE2737] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {unreadSupplier}
            </span>
          )}
        </button>
      </div>`;

appTsx = appTsx.replace(oldRoleSwitcherBtns, newRoleSwitcherBtns);

fs.writeFileSync('src/App.tsx', appTsx);

console.log("Updated App.tsx and AppContext.tsx");
