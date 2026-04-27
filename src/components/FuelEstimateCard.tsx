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
    <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000] mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-black text-xl flex items-center gap-2 game-text">
          <Fuel className="w-5 h-5 text-red-600" />
          Delivery Logistics
        </h3>
        {!estimate && !loading && (
          <button 
            onClick={fetchEstimate}
            className="text-sm px-3 py-2 bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-black font-bold transition-all shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none game-text uppercase"
          >
            Estimate with AI
          </button>
        )}
        {loading && (
          <span className="text-sm border-2 border-black px-2 py-1 bg-gray-200 text-black font-bold flex items-center gap-2 game-text uppercase">
            <Loader2 className="w-4 h-4 animate-spin text-red-600" /> Estimating...
          </span>
        )}
      </div>

      {estimate && (
        <div className="space-y-4 mt-4 border-t-4 border-black pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border-2 border-black p-3 text-center shadow-[2px_2px_0_#000]">
              <span className="block text-xs uppercase font-bold text-gray-500 game-text shadow-none">Distance</span>
              <span className="block text-xl font-bold text-black mt-1 game-text">{estimate.distance}</span>
            </div>
            <div className="bg-white border-2 border-black p-3 text-center shadow-[2px_2px_0_#000]">
              <span className="block text-xs uppercase font-bold text-gray-500 game-text shadow-none">Fuel</span>
              <span className="block text-xl font-bold text-[--color-game-pipe] mt-1 game-text">{estimate.fuelUsed}</span>
            </div>
            <div className="bg-white border-2 border-black p-3 text-center shadow-[2px_2px_0_#000]">
              <span className="block text-xs uppercase font-bold text-gray-500 game-text shadow-none">Cost</span>
              <span className="block text-xl font-bold text-[--color-game-brick] mt-1 game-text">{estimate.estimatedCost}</span>
            </div>
          </div>
          <p className="text-sm text-black leading-relaxed font-bold bg-[--color-game-coin] p-3 border-2 border-black flex items-start gap-3 game-text shadow-[2px_2px_0_#000]">
            <Navigation className="w-5 h-5 mt-1 text-red-600 shrink-0" />
            <span className="flex-1 text-lg">{estimate.routeNotes}</span>
          </p>
        </div>
      )}
    </div>
  );
}
