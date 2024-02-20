//Created by Ren Yuan


let world;

let rectangle;

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 100);
    ellipseMode(RADIUS);

    world = new c2.World(new c2.Rect(0, 0, width, height));

    for(let i=0; i<100; i++){
        let x = random(width);
        let y = random(height);
        let p = new c2.Particle(x, y);
        p.radius = random(10, height/14);
        p.color = color(random(0, 8), random(30, 60), random(20, 100));

        world.addParticle(p);
    }

    let collision = new c2.Collision();
    world.addInteractionForce(collision);

    let constForce = new c2.ConstForce(0, 1);
    world.addForce(constForce);

    let leftTop = new c2.Point(width/4, height/8*3);
    let rightBottom = new c2.Point(width/4*3, height/8*5);
    rectangle = new c2.Rect(leftTop, rightBottom);
    let rectConstraint = new c2.PolygonConstraint(rectangle);
    world.addConstraint(rectConstraint);
}

function draw() {
    background('#cccccc');

    stroke('#333333');
    strokeWeight(1);
    drawingContext.setLineDash([5, 5]);
    noFill();
    rect(rectangle.p.x, rectangle.p.y, rectangle.w, rectangle.h);

    world.update();
    
    for(let i=0; i<world.particles.length; i++){
        let p = world.particles[i];
        stroke('#333333');
        strokeWeight(1);
        drawingContext.setLineDash([]);
        fill(p.color);
        circle(p.position.x, p.position.y, p.radius);
        strokeWeight(2);
        point(p.position.x, p.position.y);
    }
}