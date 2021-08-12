import { useEffect, useState, useRef } from "react";
import { useInterval, randomIntFromInterval } from "./lib/utils.js";
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

  const [snakeCells, _setSnakeCells] = useState(
    new Set([snake.head.value.cell])
  );
  const snakeCellsRef = useRef(snakeCells);
  const setSnakeCells = (newSnakeCells) => {
    snakeCellsRef.current = newSnakeCells;
    _setSnakeCells(newSnakeCells);
  };
  // gets current reference of all snake cells

  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 4);

  const [direction, _setDirection] = useState(Direction.RIGHT);
  const directionRef = useRef(direction);
  const setDirection = (newDirection) => {
    directionRef.current = newDirection;
    _setDirection(newDirection);
  };
  // gets current reference of direction

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      handleKeydown(e);
    });
  });

  useInterval(() => {
    moveSnake();
  }, 200); // speed of snake; lower is faster

  const handleKeydown = (e) => {
    const newDirection = getKeyPress(e.key);
    // handles if key other than wasd is pressed
    const isValidDirection = newDirection !== "";
    if (!isValidDirection) return;
    const snakeEatsSelf =
      getOppositeDirection(newDirection) === directionRef.current &&
      snakeCellsRef.current.size > 1;
    if (snakeEatsSelf) return;
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
    if (isEatingItself(snakeCells, nextHeadCell)) {
      handleGameOver();
      return;
    }

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

    const foodEaten = nextHeadCell === foodCell;
    if (foodEaten) {
      growSnake(newSnakeCells);
      handleFoodEaten(newSnakeCells);
    }

    setSnakeCells(newSnakeCells);
  };

  const growSnake = (newSnakeCells) => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, grid)) {
      // if snake tail is at the edge and there is no space to grow, do nothing
      return;
    }
    const newTailCell = grid[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currTail;

    newSnakeCells.add(newTailCell);
  };

  const handleFoodEaten = (newSnakeCells) => {
    const maxCellValue = GRID_SIZE * GRID_SIZE;
    let nextFoodCell;

    while (true) {
      nextFoodCell = randomIntFromInterval(1, maxCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
        continue;
      break;
    }

    setFoodCell(nextFoodCell);
    setScore(score + 1);
  };

  const handleGameOver = () => {
    setScore(0);
    const snakeValues = startSnakeValues(grid);
    setSnake(new LinkedList(snakeValues));
    setFoodCell(snakeValues.cell + 4);
    setSnakeCells(new Set([snakeValues.cell]));
    setDirection(Direction.RIGHT);
  };

  return (
    <>
      <h1>Score: {score}</h1>
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
    </>
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

const isEatingItself = (snakeCells, nextHeadCell) => {
  if (snakeCells.has(nextHeadCell)) return true;
  return false;
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

const getGrowthNodeCoords = (snakeTail, currDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(snakeTail, currDirection);
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = {
    row: snakeTail.value.row,
    col: snakeTail.value.col,
  };
  const growthNodeCoords = getDirectionCoords(
    currentTailCoords,
    growthDirection
  );
  return growthNodeCoords;
};

const getNextNodeDirection = (node, currDirection) => {
  if (node.next === null) return currDirection;
  const { row: currRow, col: currCol } = node.value;
  const { row: nextRow, col: nextCol } = node.next.value;
  if (nextRow === currRow && nextCol === currCol + 1) {
    return Direction.RIGHT;
  }
  if (nextRow === currRow && nextCol === currCol - 1) {
    return Direction.LEFT;
  }
  if (nextCol === currCol && nextRow === currRow + 1) {
    return Direction.DOWN;
  }
  if (nextCol === currCol && nextRow === currRow - 1) {
    return Direction.UP;
  }
  return "";
};

const getOppositeDirection = (direction) => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

// function to check whether cell is a normal cell or not
const getCellName = (cellValue, snakeCells, foodCell) => {
  let cellName = "cell";
  if (cellValue === foodCell) cellName = "cell food-cell";
  if (snakeCells.has(cellValue)) cellName = "cell snake-cell";
  return cellName;
};

export default Grid;
