import { useEffect, useState } from "react";
import { useInterval } from "./lib/utils.js";
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

const startSnakeValues = (grid) => {
  const rowSize = grid.length;
  const colSize = grid[0].length;
  const startingRow = Math.round(rowSize / 2);
  const startingCol = Math.round(colSize / 3);
  const startingCell = grid[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

const Grid = () => {
  const [grid, setGrid] = useState(createGrid(GRID_SIZE));
  const [score, setScore] = useState(0);
  // starting food cell is always placed in the middle right of the grid
  const [snake, setSnake] = useState(new LinkedList(startSnakeValues(grid)));
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell])
  );
  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, setDirection] = useState(Direction.RIGHT);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      handleKeydown(e);
    });
  });

  useInterval(() => {
    moveSnake();
  }, 150);

  const handleKeydown = (e) => {
    const newDirection = getKeyPress(e.key);
    const isValidDirection = newDirection !== "";
    if (!isValidDirection) return;
    setDirection(newDirection);
  };

  const moveSnake = () => {
    const currHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getDirectionCoords(currHeadCoords, direction);
    if (isOutOfBounds(nextHeadCoords, grid)) {
      handleGameOver();
      return;
    }

    const nextHeadCell = grid[nextHeadCoords.row][nextHeadCoords.col];

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });

    const currHead = snake.head;
    snake.head = newHead;
    currHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.cell);
    newSnakeCells.add(nextHeadCell);

    snake.tail = snake.tail.next;
    if (snake.tail === null) {
      snake.tail = snake.head;
    }

    setSnakeCells(newSnakeCells);
  };

  const handleGameOver = () => {
    setScore(0);
    const snakeValues = startSnakeValues(grid);
    setSnake(new LinkedList(snakeValues));
    setFoodCell(snakeValues.cell + 5);
    setSnakeCells(new Set([snakeValues.cell]));
    setDirection(Direction.RIGHT);
  };

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

const getDirectionCoords = (coords, direction) => {
  if (direction === Direction.UP) {
    return {
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if (direction === Direction.RIGHT) {
    return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if (direction === Direction.DOWN) {
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

const isOutOfBounds = (coords, grid) => {
  const { row, col } = coords;
  if (row < 0 || col < 0) return true;
  if (row >= grid.length || col >= grid[0].length) return true;
  return false;
};

const getKeyPress = (key) => {
  if (key === "w") return Direction.UP;
  if (key === "d") return Direction.RIGHT;
  if (key === "s") return Direction.DOWN;
  if (key === "a") return Direction.LEFT;
  return "";
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
