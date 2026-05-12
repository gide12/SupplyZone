const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Replace imports
content = content.replace(
  /import { Store, Truck, MapPin, X, ImagePlus, Link as LinkIcon, Navigation, MessageCircle } from "lucide-react";/,
  'import { Store, Truck, MapPin, X, ImagePlus, Link as LinkIcon, Navigation, MessageCircle, Map, User, Package, Calculator, ScrollText } from "lucide-react";'
);

const oldTabs = `<div className="flex border-b border-gray-100 bg-white">
          <button 
            className={\`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors \${activeTab === "market" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('market')}
          >
            {translate("Marketplace Map", language).split(" ")[0]}
          </button>
          <button 
            className={\`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors relative \${activeTab === "orders" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('orders')}
          >
            {translate("Deals", language)}
            {totalUnreadOrders > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                {totalUnreadOrders}
              </span>
            )}
          </button>
          <button 
            className={\`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors \${activeTab === "inventory" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('inventory')}
          >
            {translate("Inventory", language)}
          </button>
          <button 
            className={\`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors \${activeTab === "hitung" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('hitung')}
          >
            Hitung
          </button>
          <button 
            className={\`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors \${activeTab === "profile" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('profile')}
          >
            {translate("Profile", language)}
          </button>
        </div>`;

const newTabs = `<div className="flex overflow-x-auto custom-scrollbar border-b border-gray-100 bg-white shadow-sm px-2 sm:px-6 justify-start lg:justify-center">
          <button 
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold game-text border-b-2 whitespace-nowrap transition-all duration-300 \${activeTab === "market" ? "border-[#00AA13] text-[#00AA13] sm:scale-105" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('market')}
          >
            <Map className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Marketplace Map", language).split(" ")[0]}</span>
          </button>
          <button 
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold game-text border-b-2 whitespace-nowrap transition-all duration-300 relative \${activeTab === "orders" ? "border-[#00AA13] text-[#00AA13] sm:scale-105" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('orders')}
          >
            <div className="relative">
              <ScrollText className="w-5 h-5 sm:w-4 sm:h-4" />
              {totalUnreadOrders > 0 && (
                <span className="absolute -top-1 -right-2 sm:-top-2 sm:-right-3 bg-[#EE2737] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {totalUnreadOrders}
                </span>
              )}
            </div>
            <span>{translate("Deals", language)}</span>
          </button>
          <button 
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold game-text border-b-2 whitespace-nowrap transition-all duration-300 \${activeTab === "inventory" ? "border-[#00AA13] text-[#00AA13] sm:scale-105" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Inventory", language)}</span>
          </button>
          <button 
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold game-text border-b-2 whitespace-nowrap transition-all duration-300 \${activeTab === "hitung" ? "border-[#00AA13] text-[#00AA13] sm:scale-105" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('hitung')}
          >
            <Calculator className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>Hitung</span>
          </button>
          <button 
            className={\`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold game-text border-b-2 whitespace-nowrap transition-all duration-300 \${activeTab === "profile" ? "border-[#00AA13] text-[#00AA13] sm:scale-105" : "border-transparent text-gray-500 hover:text-[#00AA13] hover:bg-gray-50"}\`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{translate("Profile", language)}</span>
          </button>
        </div>`;

if (content.includes(oldTabs)) {
   content = content.replace(oldTabs, newTabs);
   fs.writeFileSync(p, content);
   console.log('Updated tabs UI');
} else {
   console.log('Tabs not found EXACT match... updating piece by piece...');
}
