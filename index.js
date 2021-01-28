const borderWidth = 600;
const borderHeight = 600;

const { Engine, Render, Runner, World, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: true,
        width: borderWidth,
        height: borderHeight
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Generate Walls
const walls = [
    Bodies.rectangle(borderWidth / 2, 0, borderWidth, 40, { isStatic: true }),
    Bodies.rectangle(borderWidth / 2, borderHeight, borderWidth, 40, { isStatic: true }),
    Bodies.rectangle(0, borderHeight / 2, 40, borderHeight, { isStatic: true }),
    Bodies.rectangle(borderHeight, borderHeight / 2, 40, borderHeight, { isStatic: true })
];
World.add(world, walls);

//Maze Generation
const rows = 5;
const columns = 5;
const grid = Array.from(Array(rows), () => Array(columns).fill(false));
const verticals = Array.from(Array(rows), () => Array(columns - 1).fill(false));
const horizontals = Array.from(Array(rows - 1), () => Array(columns).fill(false));

function traverseMaze(r, c) {
    if (grid[r][c] === true) return;

    grid[r][c] = true; // mark as visited
    const neighbors = shuffle(getNeighbors(r, c)); // get list of random valid neighbors
    for (const neighbor of neighbors) {
        if(!hasVisited(neighbor)) moveTo(neighbor);
    }
}
function moveTo([r, c, dir]) {
    switch (dir) {
        case 'left':
            verticals[r][c] = true;
            break;
        case 'right':
            verticals[r][c-1] = true;
            break;
        case 'up':
            horizontals[r][c] = true;
            break;
        case 'down':
            horizontals[r-1][c] = true;
            break;
        default:
            console.log("invalid direction");
            break;
    }

    traverseMaze(r,c);
}

function getNeighbors(r, c) {
    return [
        [r, c - 1, 'left'], 
        [r, c + 1, 'right'], 
        [r - 1, c, 'up'], 
        [r + 1, c, 'down']
    ].filter(x => isValidNeighbor(x));
}

function isValidNeighbor([r, c]) {
    return (r >= 0 && r < rows) && (c >= 0 && c < columns) && !hasVisited([r,c]);
}

const hasVisited = ([r,c]) => grid[r][c] === true;

function shuffle(arr) {
    const count = arr.length;
    for (let i = count - 1; i >= 0; i--) {
        const swapIndex = Math.floor(Math.random() * count);
        const temp = arr[i];
        arr[i] = arr[swapIndex];
        arr[swapIndex] = temp;
    }
    return arr;
}

const startRow = Math.floor(Math.random() * rows);
const startCol = Math.floor(Math.random() * columns);
traverseMaze(startRow, startCol);