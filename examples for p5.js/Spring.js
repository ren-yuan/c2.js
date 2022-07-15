//Created by Ren Yuan


let world;

function createParticle(){
    let x = random(width);
    let y = random(height);
    let p = new c2.Particle(x, y);
    p.radius = random(10, height/15);
    p.mass = p.radius
    p.color = color(random(0, 30), random(30, 60), random(20, 100));
    world.addParticle(p);

    return p;
}

function createTree(parent, level){
  if(level==3) return;

  for(let i=0; i<3; i++){
        let p = createParticle();

        let s = new c2.Spring(parent, p);
        s.length = (parent.radius + p.radius) * 2;
        world.addSpring(s);

        createTree(p, level+1);
  }
}

function setup() {
    createCanvas(960, 540);
    colorMode(HSL, 360, 100, 100);
    ellipseMode(RADIUS);
    
    world = new c2.World(new c2.Rect(0, 0, width, height));
    createTree(createParticle(), 0);

    let gravitation = new c2.Gravitation(-10);
    gravitation.range(10);
    world.addInteractionForce(gravitation);
}

function draw() {
    background('#cccccc');

    world.update();

    for(let i=0; i<world.springs.length; i++){
        let s = world.springs[i];
        stroke('#333333');
        strokeWeight(s.length/30);
        line(s.p1.position.x, s.p1.position.y, 
            s.p2.position.x, s.p2.position.y);
    }

    for(let i=0; i<world.particles.length; i++){
        let p = world.particles[i];
        stroke('#333333');
        strokeWeight(1);
        fill(p.color);
        circle(p.position.x, p.position.y, p.radius);
    }
}