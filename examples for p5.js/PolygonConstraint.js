//Created by Ren Yuan


let world;

let polygon;

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);
    ellipseMode(RADIUS);

    world = new c2.World(new c2.Rect(0, 0, width, height));

    for(let i=0; i<100; i++){
        let x = random(width);
        let y = random(height);
        let p = new c2.Particle(x, y);
        p.radius = random(10, height/14);
        p.color = color(random(0, 30), random(30, 60), random(20, 100));

        world.addParticle(p);
    }

    let collision = new c2.Collision();
    world.addInteractionForce(collision);

    let constForce = new c2.ConstForce(0, 1);
    world.addForce(constForce);

    polygon = new c2.Polygon([
        new c2.Point(width/4, height),
        new c2.Point(width/2, height/2),
        new c2.Point(width/4*3, height)
    ]);

    let polygonConstraint = new c2.PolygonConstraint(polygon);
    world.addConstraint(polygonConstraint);
}

function draw() {
    background('#cccccc');

    polygon.clear();
    let n = 10;
    for(let i=0; i<n; i++){
        let x = c2.map(i, 0, n-1, 0, width);
        let y = height - noise(i, frameCount * .01) * height/2;
        polygon.add(new c2.Point(x, y));
    }
    polygon.add(new c2.Point(width, height));
    polygon.add(new c2.Point(0, height));

    stroke('#333333');
    strokeWeight(1);
    drawingContext.setLineDash([5, 5]);
    noFill();
    drawPolygon(polygon.vertices);

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

function drawPolygon(vertices) {
    beginShape();
    for (let v of vertices) vertex(v.x, v.y);
    endShape(CLOSE);
}