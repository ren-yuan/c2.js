//Created by Ren Yuan


let world;

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

    let arc = new c2.Arc(width/2, height, width/2, PI, 2*PI);
    let arcField = new c2.ArcField(arc, 1);
    world.addForce(arcField);
}

function draw() {
    background('#cccccc');

    world.update();

    for(let i=0; i<world.particles.length; i++){
        let p = world.particles[i];
        stroke('#333333');
        strokeWeight(1);
        fill(p.color);
        circle(p.position.x, p.position.y, p.radius);
        strokeWeight(2);
        point(p.position.x, p.position.y);
    }
}