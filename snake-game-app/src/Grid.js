import { useState } from "react";
import "./Grid.css";

const GRID_SIZE = 10;

const Grid = () => {
  const [grid, setGrid] = useState(
    new Array(GRID_SIZE).fill(0).map((row) => new Array(GRID_SIZE).fill(0))
  );
  return (
    <div className="grid">
      {grid.map((row, rowId) => (
        <div key={rowId} className="row">
          {row.map((cell, cellId) => (
            <div key={cellId} className="cell"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
