import React, { useState } from "react";
import { Fuel, Loader2, Navigation } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface FuelEstimateCardProps {
  restaurant: Restaurant;
  supplierLocation: [number, number];
}

interface FuelEstimate {
  distance: string;
  fuelUsed: string;
  estimatedCost: string;
  routeNotes: string;
}

export function FuelEstimateCard({ restaurant, supplierLocation }: FuelEstimateCardProps) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<FuelEstimate | null>(null);

  const fetchEstimate = async () => {
    setLoading(true);
    try {
      const prompt = `I am a delivery supplier located at coordinates ${supplierLocation[0]}, ${supplierLocation[1]}. 
I need to deliver to a restaurant named "${restaurant.name}" at coordinates ${restaurant.lat}, ${restaurant.lng}. 
Calculate the approximate driving distance between these two points.
Assuming I am driving a standard delivery van (around 15-20 MPG) and average fuel prices, predict the following:
1. Driving distance.
2. Fuel consumed limit/amount.
3. Estimated cost.
4. Brief AI note on the route (e.g. traffic expectations or route summary in a city like London).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distance: { type: Type.STRING, description: "Estimated driving distance (e.g. '2.5 miles')" },
              fuelUsed: { type: Type.STRING, description: "Estimated fuel consumed (e.g. '0.15 gallons')" },
              estimatedCost: { type: Type.STRING, description: "Estimated cost of fuel (e.g. '$0.60')" },
              routeNotes: { type: Type.STRING, description: "Brief note about the route (max 2 sentences)" },
            },
            required: ["distance", "fuelUsed", "estimatedCost", "routeNotes"],
          },
        },
      });

      const text = response.text || "{}";
      const data = JSON.parse(text) as FuelEstimate;
      setEstimate(data);
    } catch (error) {
      console.error(error);
      alert("Failed to estimate fuel consumption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border text-left border-slate-100 p-4 rounded-2xl shadow-sm mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-emerald-500" />
          Delivery Logistics
        </h3>
        {!estimate && !loading && (
          <button 
            onClick={fetchEstimate}
            className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold transition-colors"
          >
            Estimate with AI
          </button>
        )}
        {loading && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" /> Estimating...
          </span>
        )}
      </div>

      {estimate && (
        <div className="space-y-3 mt-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Distance</span>
              <span className="block text-sm font-bold text-slate-800 mt-0.5">{estimate.distance}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Fuel</span>
              <span className="block text-sm font-bold text-slate-800 mt-0.5">{estimate.fuelUsed}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-2 text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Cost</span>
              <span className="block text-sm font-bold text-emerald-600 mt-0.5">{estimate.estimatedCost}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed bg-blue-50/50 p-2 rounded-lg border border-blue-100/50 flex items-start gap-2">
            <Navigation className="w-3 h-3 mt-0.5 text-blue-500 shrink-0" />
            <span className="flex-1">{estimate.routeNotes}</span>
          </p>
        </div>
      )}
    </div>
  );
}
