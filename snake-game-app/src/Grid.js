import { useState } from "react";
import "./Grid.css";

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

const Direction = {
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT",
};

const GRID_SIZE = 10;

const createGrid = (GRID_SIZE) => {
  let cellCounter = 1;
  const grid = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      currentRow.push(cellCounter++);
    }
    grid.push(currentRow);
  }
  return grid;
};

const Grid = () => {
  const [grid, setGrid] = useState(createGrid(GRID_SIZE));

  // starting food cell is always placed in the middle right of the grid
  const [foodCell, setFoodCell] = useState(48);
  const [snakeCells, setSnakeCells] = useState(new Set([44]));
  const [snake, setSnake] = useState(new LinkedList(44));

  return (
    <div className="grid">
      {grid.map((row, rowId) => (
        <div key={rowId} className="row">
          {row.map((cellValue, cellId) => {
            const cellName = getCellName(cellValue, snakeCells, foodCell);
            return <div key={cellId} className={cellName}></div>;
          })}
        </div>
      ))}
    </div>
  );
};

// function to check whether cell is a normal cell or not
const getCellName = (cellValue, snakeCells, foodCell) => {
  let cellName = "cell";
  if (cellValue === foodCell) {
    cellName = "cell food-cell";
  }

  if (snakeCells.has(cellValue)) {
    cellName = "cell snake-cell";
  }
  return cellName;
};

export default Grid;
