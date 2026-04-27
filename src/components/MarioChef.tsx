import React from "react";

const GRID = [
  ". . . . . . . . . . . . . . . . . . . . .",
  ". . . . C C C C C . . . . . . . . . . . .",
  ". . . C C C C C C C . . . . . K K K . . .",
  ". . C C W W W W W C C . . . K K O K K . .",
  ". . C W W W W W W W C . . . K O O O K . .",
  ". . . W W W W W W W . . . . K K O K K . .",
  ". . . . W O O S S O S . . . . K K K . . .",
  ". . . O S O S S S O S S S . . . . . . . .",
  ". . . O S O O S S S O S S S . . . . . . .",
  ". . . O O S S S S O O O O . . P P P . . .",
  ". . . . . S S S S S S . . . P P C P P . .",
  ". . . . W W R W W W . . . . P C C C P . .",
  ". . . W W W R W W W W . . . P P C P P . .",
  ". . W W W W W W W W W W . . . P P P . . .",
  ". S S W W Y W W Y W W S S . . . . . . . .",
  ". S S S W W W W W W S S S . . G G G G . .",
  ". S S W W W W W W W W S S . G G C C G G .",
  ". . . O O O . . O O O . . . G G G G G G .",
  ". . O O O . . . . O O O . . . G G G G . .",
  ". O O O O . . . . O O O O . . . . . . . ."
];

const COLORS: Record<string, string> = {
  "W": "#ffffff", // White chef coat / hat
  "C": "#dddddd", // Chef hat shade / cookie dough
  "O": "#654321", // Brown hair/shoes/chocolate
  "S": "#ffcc99", // Skin
  "Y": "#ffea00", // Yellow buttons
  "R": "#e52521", // Red scarf
  "K": "#f4a460", // Cookie 1
  "P": "#cd853f", // Cookie 2
  "G": "#8b4513", // Tray/Pan
};

export function MarioChef({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 21 20" 
      xmlns="http://www.w3.org/2000/svg" 
      shapeRendering="crispEdges"
    >
      {GRID.map((row, y) => {
        const cells = row.split(" ");
        return cells.map((cell, x) => {
          if (cell === ".") return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={COLORS[cell]} />;
        });
      })}
    </svg>
  );
}
