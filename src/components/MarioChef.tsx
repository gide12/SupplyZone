import React from "react";

const GRID = [
  ". . . W W W W W . . . .",
  ". . W W W W W W W W W .",
  ". . O O O S S O S . . .",
  ". O S O S S S O S S S .",
  ". O S O O S S S O S S S",
  ". O O S S S S O O O O .",
  ". . . S S S S S S . . .",
  ". . R R B R R R . . . .",
  ". R R R B R R B R R . .",
  "R R R R B B B B R R R .",
  "S S R B Y B B Y B R S S",
  "S S S B B B B B B S S S",
  "S S B B B B B B B B S S",
  ". . O O O . . O O O . .",
  ". O O O . . . . O O O .",
  "O O O O . . . . O O O O"
];

const COLORS: Record<string, string> = {
  "W": "#ffffff", // White chef hat
  "O": "#654321", // Brown hair/shoes
  "S": "#ffcc99", // Skin
  "B": "#0044cc", // Blue overalls
  "Y": "#ffea00", // Yellow buttons
  "R": "#e52521", // Red shirt
};

export function MarioChef({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 12 16" 
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
