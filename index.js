const borderWidth = window.innerWidth;
const borderHeight = window.innerHeight;

const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: borderWidth,
        height: borderHeight
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

//Generate Walls
const borderThickness = 5;
const walls = [
    Bodies.rectangle(/*top border*/borderWidth / 2, 0, borderWidth, borderThickness, { isStatic: true }),
    Bodies.rectangle(/*bottom border*/borderWidth / 2, borderHeight, borderWidth, borderThickness, { isStatic: true }),
    Bodies.rectangle(/*left border*/0, borderHeight / 2, borderThickness, borderHeight, { isStatic: true }),
    Bodies.rectangle(/*right border*/borderWidth, borderHeight / 2, borderThickness, borderHeight, { isStatic: true })
];
World.add(world, walls);

//Maze Generation
const rows = 10;
const columns = Math.round(rows*borderWidth/borderHeight);
const grid = Array.from(Array(rows), () => Array(columns).fill(false));
const verticalWalls = Array.from(Array(rows), () => Array(columns - 1).fill(true));
const horizontalWalls = Array.from(Array(rows - 1), () => Array(columns).fill(true));

function generateMaze(r, c) {
    if (hasVisited([r, c])) return;

    grid[r][c] = true; // mark as visited
    const neighbors = shuffle(getNeighbors(r, c));
    for (const neighbor of neighbors) {
        if (!hasVisited(neighbor)) moveTo(neighbor);
    }
}
function moveTo([r, c, dir]) {
    switch (dir) {
        case 'left':
            verticalWalls[r][c] = false;
            break;
        case 'right':
            verticalWalls[r][c - 1] = false;
            break;
        case 'up':
            horizontalWalls[r][c] = false;
            break;
        case 'down':
            horizontalWalls[r - 1][c] = false;
            break;
        default:
            console.log("invalid direction");
            break;
    }
    generateMaze(r, c);
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
    return (r >= 0 && r < rows) && (c >= 0 && c < columns) && !hasVisited([r, c]);
}
const hasVisited = ([r, c]) => grid[r][c] === true;

function shuffle(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        const swapIndex = Math.floor(Math.random() * arr.length);
        [arr[i], arr[swapIndex]] = [arr[swapIndex], arr[i]];
    }
    return arr;
}

//Drawing Maze
const wallThickness = 5;
const cellWidth = borderWidth / columns;
const cellHeight = borderHeight / rows;
function drawMaze() {
    //draw Horizontal walls
    for (let i = 0; i < horizontalWalls.length; i++) {
        for (let j = 0; j < horizontalWalls[i].length; j++) {
            const wall = horizontalWalls[i][j];
            if (wall) {
                const xPos = (j + 0.5) * cellWidth;
                const yPos = (i + 1) * cellHeight;
                const wallRender = Bodies.rectangle(xPos, yPos, cellWidth, wallThickness, { 
                    label: 'wall',
                    isStatic: true,
                    render: {fillStyle: 'black'}
                });
                World.add(world, wallRender);
            }
        }
    }
    // draw Vertical walls
    for (let i = 0; i < verticalWalls.length; i++) {
        for (let j = 0; j < verticalWalls[i].length; j++) {
            const wall = verticalWalls[i][j];
            if (wall) {
                const xPos = (j + 1) * cellWidth;
                const yPos = (i + 0.5) * cellHeight;
                const wallRender = Bodies.rectangle(xPos, yPos, wallThickness, cellHeight, { 
                    label: 'wall',
                    isStatic: true,
                    render: {fillStyle: 'black'}
                });
                World.add(world, wallRender);
            }
        }
    }
}

//Goal
function addGoal() {
    const xPos = borderWidth - 0.5 * cellWidth;
    const yPos = borderHeight - 0.5 * cellHeight;
    const goal = Bodies.rectangle(xPos, yPos, cellWidth*0.5, cellHeight*0.5, {
        isStatic:true,
        label: 'goal',
        render: {fillStyle: 'green'}
    });
    World.add(world, goal);
}
//Player
function addPlayer(){
    const xPos = cellWidth/2;
    const yPos = cellHeight/2;
    const r = cellWidth < cellHeight ? 0.25*cellWidth : 0.25*cellHeight;
    const player = Bodies.circle(xPos, yPos, r, {
        label: 'player',
        render: {fillStyle: 'red'}
    });
    World.add(world, player);  
    
    //movement
    document.addEventListener('keydown', (event) => {
        const speed = 1/rows*60;
        const {x, y} = player.velocity;
        
        if(event.key === "w"){
            Body.setVelocity(player, {x:x,y:-speed});
        }
        if(event.key === "s"){
            Body.setVelocity(player, {x:x,y:speed});
        }
        if(event.key === "a"){
            Body.setVelocity(player, {x:-speed,y:y});
        }
        if(event.key === "d"){
            Body.setVelocity(player, {x:speed,y:y});
        }
    });
}

const startRow = Math.floor(Math.random() * rows);
const startCol = Math.floor(Math.random() * columns);
generateMaze(startRow, startCol);
drawMaze();
addGoal();
addPlayer();

//Win Condition
Events.on(engine,'collisionStart', event =>{
    const labels = ['player', 'goal'];
    for (const collision of event.pairs) {
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y = 1;
            document.querySelector('.winner').classList.remove('hidden');
            for (const body of world.bodies) {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            }
        }
    }
});