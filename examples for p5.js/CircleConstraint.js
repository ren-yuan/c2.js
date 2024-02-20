//Created by Ren Yuan


let world;

let strokeCircle;

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

    let pointField = new c2.PointField(new c2.Point(width/2, height/2), 1);
    world.addForce(pointField);

    strokeCircle = new c2.Circle(width/2, height/2, height/4);
    let circleConstraint = new c2.CircleConstraint(strokeCircle);
    world.addConstraint(circleConstraint);
}

function draw() {
    background('#cccccc');

    strokeCircle.p = new c2.Point(mouseX, mouseY);

    stroke('#333333');
    strokeWeight(1);
    drawingContext.setLineDash([5, 5]);
    noFill();
    circle(strokeCircle.p.x, strokeCircle.p.y, strokeCircle.r);

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