const borderWidth = 700;
const borderHeight = 700;

const { Engine, Render, Runner, World, Bodies, MouseConstraint, Mouse } = Matter;

const engine = Engine.create();
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

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas)
}));

//Walls
const walls = [
    Bodies.rectangle(borderWidth / 2, 0, borderWidth, 40, { isStatic: true }),
    Bodies.rectangle(borderWidth / 2, borderHeight, borderWidth, 40, { isStatic: true }),
    Bodies.rectangle(0, borderHeight / 2, 40, borderHeight, { isStatic: true }),
    Bodies.rectangle(borderHeight, borderHeight / 2, 40, borderHeight, { isStatic: true })
];
World.add(world, walls);

//Random Shapes
for (let i = 0; i < 30; i++) {
    if(Math.random()>0.5){
        World.add(world, Bodies.rectangle(borderWidth * Math.random(), borderHeight * Math.random(), 50, 50));
    }
    else{
        World.add(world, Bodies.circle(borderWidth * Math.random(), borderHeight * Math.random(), 35));
    }
}