"use client";

import { memo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useRouter } from "next/navigation";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Some mock markers representing high-trend areas
const markers = [
  { markerOffset: -15, name: "United States", coordinates: [-95.7129, 37.0902], trend: "Quantum Computing", growth: 145 },
  { markerOffset: -15, name: "United Kingdom", coordinates: [-3.4360, 55.3781], trend: "Fintech", growth: 88 },
  { markerOffset: -15, name: "Japan", coordinates: [138.2529, 36.2048], trend: "Robotics", growth: 218 },
  { markerOffset: -15, name: "Brazil", coordinates: [-51.9253, -14.2350], trend: "AgriTech", growth: 45 },
  { markerOffset: 25, name: "India", coordinates: [78.9629, 20.5937], trend: "Space Expl.", growth: 112 },
];

export const WorldMap = memo(function WorldMap() {
  const router = useRouter();
  
  return (
    <section className="relative w-full py-24" id="map">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B8B93]">World Right Now</h2>
        <div className="mt-8 rounded-3xl border border-white/5 bg-white/[0.01] p-4 md:p-8 relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 120 }}
            style={{ width: "100%", height: "auto" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#111114"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#17171B", outline: "none", cursor: "pointer" },
                      pressed: { fill: "#17171B", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {markers.map(({ name, coordinates, trend, growth }) => (
              <Marker key={name} coordinates={coordinates as [number, number]}>
                <g 
                  className="group cursor-pointer"
                  onClick={() => router.push(`/country/${name.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  <circle r={4} fill="#06b6d4" className="opacity-80 group-hover:scale-150 transition-transform" />
                  <circle r={12} fill="#06b6d4" className="animate-ping opacity-20" />
                  
                  {/* Custom Tooltip on hover */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <rect x={10} y={-40} width={140} height={60} rx={8} fill="#111114" stroke="rgba(255,255,255,0.1)" />
                    <text x={20} y={-20} fill="#8B8B93" fontSize={10} fontWeight="bold" className="uppercase tracking-wider">
                      {name}
                    </text>
                    <text x={20} y={-5} fill="#F5F5F5" fontSize={12} fontWeight="medium">
                      {trend}
                    </text>
                    <text x={110} y={-5} fill="#06b6d4" fontSize={12} fontWeight="bold">
                      +{growth}%
                    </text>
                  </g>
                </g>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </section>
  );
});
